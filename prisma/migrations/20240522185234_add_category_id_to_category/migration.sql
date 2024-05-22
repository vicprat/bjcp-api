/*
  Warnings:

  - A unique constraint covering the columns `[category_id]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "BeerStyle" DROP CONSTRAINT "BeerStyle_category_id_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "Category_category_id_key" ON "Category"("category_id");

-- AddForeignKey
ALTER TABLE "BeerStyle" ADD CONSTRAINT "BeerStyle_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;
