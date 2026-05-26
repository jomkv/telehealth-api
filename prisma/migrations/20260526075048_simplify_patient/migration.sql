/*
  Warnings:

  - You are about to drop the `MedicalHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MedicalHistory" DROP CONSTRAINT "MedicalHistory_patientId_fkey";

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "allergies" TEXT[],
ADD COLUMN     "conditions" TEXT[],
ADD COLUMN     "medications" TEXT[],
ADD COLUMN     "notes" TEXT;

-- DropTable
DROP TABLE "MedicalHistory";
