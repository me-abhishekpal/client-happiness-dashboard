/*
  Warnings:

  - You are about to drop the column `serviceId` on the `Engagement` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,tenantId]` on the table `Engagement` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Engagement" DROP CONSTRAINT "Engagement_serviceId_fkey";

-- DropIndex
DROP INDEX "Engagement_name_serviceId_tenantId_key";

-- DropIndex
DROP INDEX "Engagement_serviceId_idx";

-- AlterTable
ALTER TABLE "Engagement" DROP COLUMN "serviceId";

-- CreateTable
CREATE TABLE "_EngagementToService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EngagementToService_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EngagementToService_B_index" ON "_EngagementToService"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Engagement_name_tenantId_key" ON "Engagement"("name", "tenantId");

-- AddForeignKey
ALTER TABLE "_EngagementToService" ADD CONSTRAINT "_EngagementToService_A_fkey" FOREIGN KEY ("A") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EngagementToService" ADD CONSTRAINT "_EngagementToService_B_fkey" FOREIGN KEY ("B") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
