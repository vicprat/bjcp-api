-- DropForeignKey
ALTER TABLE "BeerStyle" DROP CONSTRAINT "BeerStyle_category_id_fkey";

-- DropIndex
DROP INDEX "Category_category_id_key";

-- AddForeignKey
ALTER TABLE "BeerStyle" ADD CONSTRAINT "BeerStyle_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
