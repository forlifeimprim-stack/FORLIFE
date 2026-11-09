-- AlterTable
ALTER TABLE "ContentItem" ADD COLUMN     "mediaVersionId" TEXT;

-- CreateTable
CREATE TABLE "CreativeBrief" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "contentId" TEXT,
    "campaignId" TEXT,
    "objective" "ObjectiveType" NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'SQUARE',
    "subject" TEXT NOT NULL,
    "offer" TEXT,
    "cta" TEXT,
    "productAssetId" TEXT,
    "artDirection" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "aiRunId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreativeBrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreativeConcept" (
    "id" TEXT NOT NULL,
    "briefId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "layout" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "subline" TEXT,
    "cta" TEXT,
    "mood" TEXT,
    "imagePrompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreativeConcept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreativeVersion" (
    "id" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "spec" JSONB NOT NULL,
    "storageKey" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "critic" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreativeVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreativeBrief_workspaceId_createdAt_idx" ON "CreativeBrief"("workspaceId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CreativeVersion_storageKey_key" ON "CreativeVersion"("storageKey");

-- CreateIndex
CREATE INDEX "CreativeVersion_workspaceId_createdAt_idx" ON "CreativeVersion"("workspaceId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CreativeVersion_conceptId_version_key" ON "CreativeVersion"("conceptId", "version");

-- AddForeignKey
ALTER TABLE "CreativeBrief" ADD CONSTRAINT "CreativeBrief_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreativeConcept" ADD CONSTRAINT "CreativeConcept_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "CreativeBrief"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreativeVersion" ADD CONSTRAINT "CreativeVersion_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "CreativeConcept"("id") ON DELETE CASCADE ON UPDATE CASCADE;
