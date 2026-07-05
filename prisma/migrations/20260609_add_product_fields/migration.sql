-- AlterTable
ALTER TABLE "Product" ADD COLUMN "category" TEXT,
ADD COLUMN "breed" TEXT,
ADD COLUMN "healthStatus" TEXT,
ADD COLUMN "ageOrWeight" TEXT,
ADD COLUMN "documents" TEXT NOT NULL DEFAULT '[]';
