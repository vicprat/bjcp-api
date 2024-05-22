/*
  Warnings:

  - You are about to drop the column `alcohol_by_volume_max` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `alcohol_by_volume_min` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `color_max` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `color_min` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `final_gravity_max` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `final_gravity_min` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `international_bitterness_units_max` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `international_bitterness_units_min` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `original_gravity_max` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `original_gravity_min` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `overall_impression` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `style_comparison` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `style_guide` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `style_id` on the `BeerStyle` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `Category` table. All the data in the column will be lost.
  - Added the required column `alcoholByVolumeMax` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `alcoholByVolumeMin` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `colorMax` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `colorMin` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalGravityMax` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalGravityMin` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `internationalBitternessUnitsMax` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `internationalBitternessUnitsMin` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalGravityMax` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalGravityMin` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overallImpression` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `styleComparison` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `styleGuide` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `styleId` to the `BeerStyle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BeerStyle" DROP CONSTRAINT "BeerStyle_category_id_fkey";

-- AlterTable
ALTER TABLE "BeerStyle" DROP COLUMN "alcohol_by_volume_max",
DROP COLUMN "alcohol_by_volume_min",
DROP COLUMN "category_id",
DROP COLUMN "color_max",
DROP COLUMN "color_min",
DROP COLUMN "final_gravity_max",
DROP COLUMN "final_gravity_min",
DROP COLUMN "international_bitterness_units_max",
DROP COLUMN "international_bitterness_units_min",
DROP COLUMN "original_gravity_max",
DROP COLUMN "original_gravity_min",
DROP COLUMN "overall_impression",
DROP COLUMN "style_comparison",
DROP COLUMN "style_guide",
DROP COLUMN "style_id",
ADD COLUMN     "alcoholByVolumeMax" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "alcoholByVolumeMin" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "colorMax" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "colorMin" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "finalGravityMax" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "finalGravityMin" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "internationalBitternessUnitsMax" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "internationalBitternessUnitsMin" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "originalGravityMax" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "originalGravityMin" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "overallImpression" TEXT NOT NULL,
ADD COLUMN     "styleComparison" TEXT NOT NULL,
ADD COLUMN     "styleGuide" TEXT NOT NULL,
ADD COLUMN     "styleId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "category_id";

-- AddForeignKey
ALTER TABLE "BeerStyle" ADD CONSTRAINT "BeerStyle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
