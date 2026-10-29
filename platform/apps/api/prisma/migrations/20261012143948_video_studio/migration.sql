-- CreateTable
CREATE TABLE "VideoProject" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "objective" "ObjectiveType" NOT NULL,
    "brief" TEXT NOT NULL,
    "offer" TEXT,
    "cta" TEXT,
    "durationTarget" INTEGER NOT NULL DEFAULT 15,
    "hook" TEXT,
    "productAssetIds" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "contentId" TEXT,
    "campaignId" TEXT,
    "aiRunId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoScene" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "overlay" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "assetId" TEXT,
    "motion" TEXT NOT NULL DEFAULT 'ZOOM_IN',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoScene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoRender" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "storageKey" TEXT,
    "srtKey" TEXT,
    "durationSec" DOUBLE PRECISION,
    "sizeBytes" INTEGER,
    "qc" JSONB,
    "score" INTEGER,
    "error" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "VideoRender_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VideoProject_workspaceId_createdAt_idx" ON "VideoProject"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "VideoScene_projectId_order_idx" ON "VideoScene"("projectId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "VideoRender_projectId_version_key" ON "VideoRender"("projectId", "version");

-- AddForeignKey
ALTER TABLE "VideoProject" ADD CONSTRAINT "VideoProject_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoScene" ADD CONSTRAINT "VideoScene_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "VideoProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoRender" ADD CONSTRAINT "VideoRender_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "VideoProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
