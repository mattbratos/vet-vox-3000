-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Medication" ADD VALUE 'UNKNOWN';
ALTER TYPE "Medication" ADD VALUE 'NONE';

-- AlterEnum
ALTER TYPE "PatientName" ADD VALUE 'UNKNOWN';

-- AlterEnum
ALTER TYPE "Species" ADD VALUE 'UNKNOWN';

-- AlterEnum
ALTER TYPE "VetName" ADD VALUE 'UNKNOWN';
