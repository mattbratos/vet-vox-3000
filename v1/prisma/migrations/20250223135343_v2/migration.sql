/*
  Warnings:

  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PatientName" AS ENUM ('MAX', 'BELLA', 'CHARLIE', 'LUNA', 'ROCKY');

-- CreateEnum
CREATE TYPE "VetName" AS ENUM ('DR_SMITH', 'DR_JOHNSON', 'DR_WILLIAMS', 'DR_BROWN', 'DR_DAVIS');

-- CreateEnum
CREATE TYPE "Species" AS ENUM ('DOG', 'CAT', 'COW', 'CHICKEN', 'MONKEY');

-- CreateEnum
CREATE TYPE "Medication" AS ENUM ('PARACETAMOL', 'AMOXICILLIN', 'IBUPROFEN', 'KETAMINE', 'FENTANYL', 'LSD');

-- DropTable
DROP TABLE "Note";

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "vetName" "VetName" NOT NULL,
    "patientName" "PatientName" NOT NULL,
    "species" "Species" NOT NULL,
    "medications" "Medication"[],
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);
