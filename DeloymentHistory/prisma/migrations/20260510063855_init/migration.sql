/*
  Warnings:

  - Added the required column `userId` to the `DeploymentHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DeploymentHistory" ADD COLUMN     "userId" TEXT NOT NULL;
