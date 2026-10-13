-- CreateEnum
CREATE TYPE "CopilotMode" AS ENUM ('ASSISTED', 'COPILOT', 'AUTOPILOT');

-- CreateEnum
CREATE TYPE "CopilotActionStatus" AS ENUM ('PROPOSED', 'EXECUTED', 'REJECTED', 'FAILED');

-- CreateTable
CREATE TABLE "CopilotSettings" (
    "workspaceId" TEXT NOT NULL,
    "mode" "CopilotMode" NOT NULL DEFAULT 'COPILOT',
    "autoActions" JSONB NOT NULL DEFAULT '[]',
    "dailyAutoLimit" INTEGER NOT NULL DEFAULT 10,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CopilotSettings_pkey" PRIMARY KEY ("workspaceId")
);

-- CreateTable
CREATE TABLE "CopilotConversation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agent" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Nouvelle conversation',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CopilotConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CopilotMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'DONE',
    "jobId" TEXT,
    "aiRunId" TEXT,
    "isSimulated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CopilotMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CopilotAction" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "params" JSONB NOT NULL DEFAULT '{}',
    "rationale" TEXT,
    "status" "CopilotActionStatus" NOT NULL DEFAULT 'PROPOSED',
    "auto" BOOLEAN NOT NULL DEFAULT false,
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "resultType" TEXT,
    "resultId" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CopilotAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CopilotConversation_workspaceId_userId_updatedAt_idx" ON "CopilotConversation"("workspaceId", "userId", "updatedAt");

-- CreateIndex
CREATE INDEX "CopilotMessage_conversationId_createdAt_idx" ON "CopilotMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "CopilotAction_workspaceId_status_decidedAt_idx" ON "CopilotAction"("workspaceId", "status", "decidedAt");

-- CreateIndex
CREATE INDEX "CopilotAction_conversationId_idx" ON "CopilotAction"("conversationId");

-- AddForeignKey
ALTER TABLE "CopilotSettings" ADD CONSTRAINT "CopilotSettings_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopilotConversation" ADD CONSTRAINT "CopilotConversation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopilotMessage" ADD CONSTRAINT "CopilotMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "CopilotConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopilotAction" ADD CONSTRAINT "CopilotAction_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "CopilotConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopilotAction" ADD CONSTRAINT "CopilotAction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "CopilotMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
