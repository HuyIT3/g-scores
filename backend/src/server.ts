import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { SubjectManager } from './domain/subject';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Validation Middleware for SBD (must be 8-digit numeric string)
const validateSbd = (req: Request, res: Response, next: Function) => {
  const { sbd } = req.params;
  const sbdRegex = /^[0-9]{8}$/;
  if (!sbd || !sbdRegex.test(sbd)) {
    return res.status(400).json({
      error: 'Số báo danh không hợp lệ. SBD phải bao gồm đúng 8 chữ số.'
    });
  }
  next();
};

// 1. Check score from registration number (SBD) input
app.get('/api/scores/:sbd', validateSbd, async (req: Request, res: Response) => {
  const { sbd } = req.params;

  try {
    const student = await prisma.student.findUnique({
      where: { sbd }
    });

    if (!student) {
      return res.status(404).json({
        error: `Không tìm thấy thí sinh với Số báo danh (SBD) là ${sbd}.`
      });
    }

    // Format response using Subject OOP classes
    const subjectManager = SubjectManager.getInstance();
    const scores = subjectManager.getSubjects().map(sub => {
      const rawValue = student[sub.dbField as keyof typeof student];
      const score = typeof rawValue === 'number' ? rawValue : null;
      return {
        code: sub.code,
        name: sub.name,
        score,
        level: sub.classify(score)
      };
    });

    return res.json({
      sbd: student.sbd,
      ma_ngoai_ngu: student.ma_ngoai_ngu,
      scores
    });
  } catch (error) {
    console.error('Error fetching score:', error);
    return res.status(500).json({ error: 'Lỗi hệ thống khi tìm kiếm điểm.' });
  }
});

// 2. Get pre-computed subject statistics for charts
app.get('/api/reports/statistics', async (req: Request, res: Response) => {
  try {
    const dbStats = await prisma.subjectStatistic.findMany();
    const subjectManager = SubjectManager.getInstance();

    const statistics = subjectManager.getSubjects().map(sub => {
      const subStats = dbStats.filter(s => s.subject === sub.code);
      const levels: Record<string, number> = {
        '>=8': 0,
        '6-8': 0,
        '4-6': 0,
        '<4': 0
      };

      for (const s of subStats) {
        levels[s.level] = s.count;
      }

      return {
        code: sub.code,
        name: sub.name,
        levels
      };
    });

    return res.json(statistics);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return res.status(500).json({ error: 'Lỗi hệ thống khi tải báo cáo thống kê.' });
  }
});

// 3. List top 10 students of group A (Math, Physics, Chemistry)
app.get('/api/reports/top10', async (req: Request, res: Response) => {
  try {
    // Run a high-performance query calculating total score of Math, Physics, and Chemistry
    const topStudentsRaw = await prisma.$queryRaw<any[]>`
      SELECT sbd, toan, vat_li, hoa_hoc, 
             (toan + vat_li + hoa_hoc) AS totalScore
      FROM Student
      WHERE toan IS NOT NULL 
        AND vat_li IS NOT NULL 
        AND hoa_hoc IS NOT NULL
      ORDER BY totalScore DESC, sbd ASC
      LIMIT 10
    `;

    // Map fields cleanly
    const topStudents = topStudentsRaw.map((s, index) => ({
      rank: index + 1,
      sbd: s.sbd,
      scores: {
        toan: s.toan,
        vat_li: s.vat_li,
        hoa_hoc: s.hoa_hoc
      },
      totalScore: Number(s.totalScore.toFixed(2))
    }));

    return res.json(topStudents);
  } catch (error) {
    console.error('Error fetching top 10:', error);
    return res.status(500).json({ error: 'Lỗi hệ thống khi tải top 10 học sinh.' });
  }
});

app.listen(port, () => {
  console.log(`[Server]: Server is running at http://localhost:${port}`);
});
