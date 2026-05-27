/*
  Warnings:

  - You are about to drop the `Availability` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- DropForeignKey
ALTER TABLE "Availability" DROP CONSTRAINT "Availability_doctorId_fkey";

-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "rescheduledFrom" TIMESTAMP(3),
ALTER COLUMN "doctorNotes" DROP NOT NULL;

-- DropTable
DROP TABLE "Availability";

-- CreateTable
CREATE TABLE "AvailabilityTemplate" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "AvailabilityTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilityTemplate_doctorId_dayOfWeek_key" ON "AvailabilityTemplate"("doctorId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "AvailabilityTemplate" ADD CONSTRAINT "AvailabilityTemplate_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
