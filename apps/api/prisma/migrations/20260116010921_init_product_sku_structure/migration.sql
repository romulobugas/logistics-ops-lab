/*
  Warnings:

  - You are about to drop the column `code` on the `skus` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `skus` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ean]` on the table `skus` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productId` to the `skus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitId` to the `skus` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "skus_code_key";

-- AlterTable
ALTER TABLE "skus" DROP COLUMN "code",
DROP COLUMN "unit",
ADD COLUMN     "conversionFactor" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "ean" TEXT,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "length" DOUBLE PRECISION,
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "unitId" TEXT NOT NULL,
ADD COLUMN     "weight" DOUBLE PRECISION,
ADD COLUMN     "width" DOUBLE PRECISION,
ALTER COLUMN "description" DROP NOT NULL;

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productGroupId" TEXT,
    "storageGroupId" TEXT,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storage_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "storage_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");

-- CreateIndex
CREATE UNIQUE INDEX "units_name_key" ON "units"("name");

-- CreateIndex
CREATE UNIQUE INDEX "units_abbreviation_key" ON "units"("abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "product_groups_name_key" ON "product_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "storage_groups_name_key" ON "storage_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "skus_ean_key" ON "skus"("ean");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_productGroupId_fkey" FOREIGN KEY ("productGroupId") REFERENCES "product_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_storageGroupId_fkey" FOREIGN KEY ("storageGroupId") REFERENCES "storage_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skus" ADD CONSTRAINT "skus_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skus" ADD CONSTRAINT "skus_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
