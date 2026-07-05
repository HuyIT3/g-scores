-- CreateTable
CREATE TABLE "Student" (
    "sbd" TEXT NOT NULL PRIMARY KEY,
    "toan" REAL,
    "ngu_van" REAL,
    "ngoai_ngu" REAL,
    "vat_li" REAL,
    "hoa_hoc" REAL,
    "sinh_hoc" REAL,
    "lich_su" REAL,
    "dia_li" REAL,
    "gdcd" REAL,
    "ma_ngoai_ngu" TEXT
);

-- CreateTable
CREATE TABLE "SubjectStatistic" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subject" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "count" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "Student_sbd_idx" ON "Student"("sbd");

-- CreateIndex
CREATE INDEX "Student_toan_vat_li_hoa_hoc_idx" ON "Student"("toan", "vat_li", "hoa_hoc");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectStatistic_subject_level_key" ON "SubjectStatistic"("subject", "level");
