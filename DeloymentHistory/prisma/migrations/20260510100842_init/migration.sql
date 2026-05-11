/*
  Warnings:

  - You are about to drop the `DeploymentHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "DeploymentHistory";

-- CreateTable
CREATE TABLE "Deployment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "deployedUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeTaken" INTEGER,

    CONSTRAINT "Deployment_pkey" PRIMARY KEY ("id")
);
