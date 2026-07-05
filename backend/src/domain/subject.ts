export enum ScoreLevel {
  EXCELLENT = '>=8',
  GOOD = '6-8',
  AVERAGE = '4-6',
  POOR = '<4'
}

export abstract class Subject {
  abstract readonly code: string;
  abstract readonly name: string;
  abstract readonly dbField: string;

  classify(score: number | null | undefined): ScoreLevel | null {
    if (score === null || score === undefined) return null;
    if (score >= 8) return ScoreLevel.EXCELLENT;
    if (score >= 6) return ScoreLevel.GOOD;
    if (score >= 4) return ScoreLevel.AVERAGE;
    return ScoreLevel.POOR;
  }

  validate(score: number | null | undefined): boolean {
    if (score === null || score === undefined) return true;
    return score >= 0 && score <= 10;
  }
}

export class MathSubject extends Subject {
  readonly code = 'toan';
  readonly name = 'Toán';
  readonly dbField = 'toan';
}

export class LiteratureSubject extends Subject {
  readonly code = 'ngu_van';
  readonly name = 'Ngữ văn';
  readonly dbField = 'ngu_van';
}

export class ForeignLanguageSubject extends Subject {
  readonly code = 'ngoai_ngu';
  readonly name = 'Ngoại ngữ';
  readonly dbField = 'ngoai_ngu';
}

export class PhysicsSubject extends Subject {
  readonly code = 'vat_li';
  readonly name = 'Vật lý';
  readonly dbField = 'vat_li';
}

export class ChemistrySubject extends Subject {
  readonly code = 'hoa_hoc';
  readonly name = 'Hóa học';
  readonly dbField = 'hoa_hoc';
}

export class BiologySubject extends Subject {
  readonly code = 'sinh_hoc';
  readonly name = 'Sinh học';
  readonly dbField = 'sinh_hoc';
}

export class HistorySubject extends Subject {
  readonly code = 'lich_su';
  readonly name = 'Lịch sử';
  readonly dbField = 'lich_su';
}

export class GeographySubject extends Subject {
  readonly code = 'dia_li';
  readonly name = 'Địa lý';
  readonly dbField = 'dia_li';
}

export class CivicEducationSubject extends Subject {
  readonly code = 'gdcd';
  readonly name = 'GDCD';
  readonly dbField = 'gdcd';
}

export class SubjectManager {
  private static instance: SubjectManager;
  private subjects: Subject[] = [];

  private constructor() {
    this.subjects = [
      new MathSubject(),
      new LiteratureSubject(),
      new ForeignLanguageSubject(),
      new PhysicsSubject(),
      new ChemistrySubject(),
      new BiologySubject(),
      new HistorySubject(),
      new GeographySubject(),
      new CivicEducationSubject()
    ];
  }

  public static getInstance(): SubjectManager {
    if (!SubjectManager.instance) {
      SubjectManager.instance = new SubjectManager();
    }
    return SubjectManager.instance;
  }

  public getSubjects(): Subject[] {
    return this.subjects;
  }

  public getSubjectByField(field: string): Subject | undefined {
    return this.subjects.find(s => s.dbField === field);
  }
}
