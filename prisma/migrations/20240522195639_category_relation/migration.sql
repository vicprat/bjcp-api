/*
  Warnings:

  - You are about to drop the column `alcoholByVolumeMax` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `alcoholByVolumeMin` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `colorMax` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `colorMin` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `finalGravityMax` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `finalGravityMin` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `internationalBitternessUnitsMax` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `internationalBitternessUnitsMin` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `originalGravityMax` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `originalGravityMin` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `overallImpression` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `styleComparison` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `styleGuide` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `styleId` on the `BeerStyle` table. All the data in the column will be lost.
  - Added the required column `alcohol_by_volume_max` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `alcohol_by_volume_min` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color_max` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color_min` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `final_gravity_max` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `final_gravity_min` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `international_bitterness_units_max` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `international_bitterness_units_min` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_gravity_max` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_gravity_min` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overall_impression` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `style_comparison` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `style_guide` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `style_id` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BeerStyle" DROP CONSTRAINT "BeerStyle_categoryId_fkey";

-- AlterTable
ALTER TABLE "BeerStyle" DROP COLUMN "alcoholByVolumeMax",
DROP COLUMN "alcoholByVolumeMin",
DROP COLUMN "categoryId",
DROP COLUMN "colorMax",
DROP COLUMN "colorMin",
DROP COLUMN "finalGravityMax",
DROP COLUMN "finalGravityMin",
DROP COLUMN "internationalBitternessUnitsMax",
DROP COLUMN "internationalBitternessUnitsMin",
DROP COLUMN "originalGravityMax",
DROP COLUMN "originalGravityMin",
DROP COLUMN "overallImpression",
DROP COLUMN "styleComparison",
DROP COLUMN "styleGuide",
DROP COLUMN "styleId",
ADD COLUMN     "alcohol_by_volume_max" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "alcohol_by_volume_min" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "category_id" INTEGER NOT NULL,
ADD COLUMN     "color_max" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "color_min" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "final_gravity_max" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "final_gravity_min" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "international_bitterness_units_max" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "international_bitterness_units_min" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "original_gravity_max" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "original_gravity_min" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "overall_impression" TEXT NOT NULL,
ADD COLUMN     "style_comparison" TEXT NOT NULL,
ADD COLUMN     "style_guide" TEXT NOT NULL,
ADD COLUMN     "style_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "BeerStyle" ADD CONSTRAINT "BeerStyle_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
