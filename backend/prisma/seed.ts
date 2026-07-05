import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { PrismaClient } from '@prisma/client';
import { SubjectManager } from '../src/domain/subject';

const prisma = new PrismaClient();

function parseScore(val: string | undefined): number | null {
  if (!val) return null;
  const trimmed = val.trim();
  if (trimmed === '') return null;
  const num = parseFloat(trimmed);
  return isNaN(num) ? null : num;
}

async function main() {
  const csvFilePath = path.join(__dirname, '../../dataset/diem_thi_thpt_2024.csv');
  console.log(`Starting to seed from: ${csvFilePath}`);

  // Clear tables
  console.log('Clearing existing data...');
  await prisma.subjectStatistic.deleteMany();
  await prisma.student.deleteMany();
  console.log('Cleared existing data.');

  const fileStream = fs.createReadStream(csvFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const subjectManager = SubjectManager.getInstance();
  const subjects = subjectManager.getSubjects();

  // In-memory statistics structure
  const stats: Record<string, Record<string, number>> = {};
  for (const s of subjects) {
    stats[s.code] = {
      '>=8': 0,
      '6-8': 0,
      '4-6': 0,
      '<4': 0
    };
  }

  let isHeader = true;
  let batch: any[] = [];
  const BATCH_SIZE = 2000;
  let totalCount = 0;
  const startTime = Date.now();

  for await (const line of rl) {
    if (isHeader) {
      isHeader = false;
      continue;
    }

    const parts = line.split(',');
    if (parts.length < 11) continue;

    const sbd = parts[0].trim();
    if (!sbd) continue;

    const record = {
      sbd,
      toan: parseScore(parts[1]),
      ngu_van: parseScore(parts[2]),
      ngoai_ngu: parseScore(parts[3]),
      vat_li: parseScore(parts[4]),
      hoa_hoc: parseScore(parts[5]),
      sinh_hoc: parseScore(parts[6]),
      lich_su: parseScore(parts[7]),
      dia_li: parseScore(parts[8]),
      gdcd: parseScore(parts[9]),
      ma_ngoai_ngu: parts[10] && parts[10].trim() !== '' ? parts[10].trim() : null
    };

    // Update statistics in memory
    for (const sub of subjects) {
      const score = record[sub.dbField as keyof typeof record];
      if (typeof score === 'number') {
        const level = sub.classify(score);
        if (level) {
          stats[sub.code][level]++;
        }
      }
    }

    batch.push(record);

    if (batch.length >= BATCH_SIZE) {
      await prisma.student.createMany({
        data: batch
      });
      totalCount += batch.length;
      if (totalCount % 50000 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`Seeded ${totalCount} records... (${elapsed}s elapsed)`);
      }
      batch = [];
    }
  }

  // Insert the remaining batch
  if (batch.length > 0) {
    await prisma.student.createMany({
      data: batch
    });
    totalCount += batch.length;
  }

  const elapsedTotal = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Total students seeded: ${totalCount} in ${elapsedTotal}s`);

  // Insert pre-computed statistics
  console.log('Saving pre-computed subject statistics...');
  const statsBatch: any[] = [];
  for (const subjectCode of Object.keys(stats)) {
    for (const level of Object.keys(stats[subjectCode])) {
      statsBatch.push({
        subject: subjectCode,
        level,
        count: stats[subjectCode][level]
      });
    }
  }

  await prisma.subjectStatistic.createMany({
    data: statsBatch
  });

  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
