-- CreateTable
CREATE TABLE "SocialAudit" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "links" JSONB NOT NULL DEFAULT '{}',
    "postsCount" INTEGER NOT NULL,
    "stats" JSONB NOT NULL,
    "report" JSONB NOT NULL,
    "sourcesText" TEXT NOT NULL,
    "aiRunId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialAudit_workspaceId_createdAt_idx" ON "SocialAudit"("workspaceId", "createdAt");

-- AddForeignKey
ALTER TABLE "SocialAudit" ADD CONSTRAINT "SocialAudit_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
