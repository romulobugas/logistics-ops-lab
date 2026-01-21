/*
  Warnings:

  - A unique constraint covering the columns `[deposit,street,block,level,apartment]` on the table `stock_locations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deposit` to the `stock_locations` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "stock_locations_street_block_level_apartment_key";

-- AlterTable
ALTER TABLE "stock_activities" ADD COLUMN     "destinationLocationId" TEXT;

-- AlterTable
ALTER TABLE "stock_locations" ADD COLUMN     "deposit" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "destinationLocationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "stock_locations_deposit_street_block_level_apartment_key" ON "stock_locations"("deposit", "street", "block", "level", "apartment");

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_destinationLocationId_fkey" FOREIGN KEY ("destinationLocationId") REFERENCES "stock_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_activities" ADD CONSTRAINT "stock_activities_destinationLocationId_fkey" FOREIGN KEY ("destinationLocationId") REFERENCES "stock_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
