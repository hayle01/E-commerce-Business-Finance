-- CreateEnum
CREATE TYPE "IncomeKind" AS ENUM ('BUSINESS', 'PERSONAL');

-- AlterTable
ALTER TABLE "OtherIncome" ADD COLUMN     "incomeKind" "IncomeKind" NOT NULL DEFAULT 'BUSINESS';
