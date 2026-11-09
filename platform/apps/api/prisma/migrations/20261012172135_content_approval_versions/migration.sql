-- AlterTable
ALTER TABLE "Approval" ADD COLUMN     "contentVersion" INTEGER;

-- AlterTable
ALTER TABLE "ContentItem" ADD COLUMN     "approvedVersion" INTEGER,
ADD COLUMN     "contentVersion" INTEGER NOT NULL DEFAULT 1;

-- Contenus déjà approuvés avant cette version : leur version courante est considérée comme approuvée.
UPDATE "ContentItem" SET "approvedVersion" = "contentVersion" WHERE "status" IN ('APPROVED', 'SCHEDULED', 'PUBLISHED');
