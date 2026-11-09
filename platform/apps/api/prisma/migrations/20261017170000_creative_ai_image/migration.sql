-- AlterTable
ALTER TABLE "CreativeBrief" ADD COLUMN     "aiImage" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "CreativeConcept" ADD COLUMN     "backgroundKey" TEXT,
ADD COLUMN     "backgroundNote" TEXT;
