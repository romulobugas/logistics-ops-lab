/*
  Warnings:

  - You are about to drop the column `description` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `skus` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `skus` table. All the data in the column will be lost.
  - You are about to drop the column `length` on the `skus` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `skus` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `skus` table. All the data in the column will be lost.
  - Added the required column `name` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "description",
ADD COLUMN     "altPickingUnitId" TEXT,
ADD COLUMN     "baseUnitId" TEXT,
ADD COLUMN     "closedPanel" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "controlsBatch" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "controlsExpiry" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "depositor" TEXT,
ADD COLUMN     "dynamicPicking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "entryUnitId" TEXT,
ADD COLUMN     "gridSewing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "informExpiryOnCheck" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isProductKit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "makesOrder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxStockLevel" INTEGER,
ADD COLUMN     "minStockLevel" INTEGER,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "pickingUnitId" TEXT,
ADD COLUMN     "productType" TEXT,
ADD COLUMN     "quarantine" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quarantineDays" INTEGER,
ADD COLUMN     "sanitaryClassification" TEXT,
ADD COLUMN     "separationMagnitude" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shelfLifeDays" INTEGER,
ADD COLUMN     "showOnEntryNote" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "specialComposition" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "storageUnitId" TEXT,
ADD COLUMN     "supplier" TEXT,
ADD COLUMN     "usefulLifeDays" INTEGER;

-- AlterTable
ALTER TABLE "skus" DROP COLUMN "description",
DROP COLUMN "height",
DROP COLUMN "length",
DROP COLUMN "weight",
DROP COLUMN "width",
ADD COLUMN     "allowBarcodeZero" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allowConsignated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allowOverlap" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allowTumble" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "heightCm" DOUBLE PRECISION,
ADD COLUMN     "lastro" INTEGER,
ADD COLUMN     "lengthCm" DOUBLE PRECISION,
ADD COLUMN     "maxHeightCm" DOUBLE PRECISION,
ADD COLUMN     "palletizing" INTEGER,
ADD COLUMN     "recipientType" TEXT,
ADD COLUMN     "size" TEXT,
ADD COLUMN     "standardBox" TEXT,
ADD COLUMN     "standardPallet" TEXT,
ADD COLUMN     "volumeM3" DOUBLE PRECISION,
ADD COLUMN     "weightKg" DOUBLE PRECISION,
ADD COLUMN     "widthCm" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_baseUnitId_fkey" FOREIGN KEY ("baseUnitId") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_entryUnitId_fkey" FOREIGN KEY ("entryUnitId") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_storageUnitId_fkey" FOREIGN KEY ("storageUnitId") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_pickingUnitId_fkey" FOREIGN KEY ("pickingUnitId") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_altPickingUnitId_fkey" FOREIGN KEY ("altPickingUnitId") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;
