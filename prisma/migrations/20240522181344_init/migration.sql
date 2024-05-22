-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeerStyle" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "style_id" TEXT NOT NULL,
    "overall_impression" TEXT NOT NULL,
    "aroma" TEXT NOT NULL,
    "appearance" TEXT NOT NULL,
    "flavor" TEXT NOT NULL,
    "mouthfeel" TEXT NOT NULL,
    "comments" TEXT NOT NULL,
    "history" TEXT NOT NULL,
    "style_comparison" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "original_gravity_min" DOUBLE PRECISION NOT NULL,
    "original_gravity_max" DOUBLE PRECISION NOT NULL,
    "international_bitterness_units_min" DOUBLE PRECISION NOT NULL,
    "international_bitterness_units_max" DOUBLE PRECISION NOT NULL,
    "final_gravity_min" DOUBLE PRECISION NOT NULL,
    "final_gravity_max" DOUBLE PRECISION NOT NULL,
    "alcohol_by_volume_min" DOUBLE PRECISION NOT NULL,
    "alcohol_by_volume_max" DOUBLE PRECISION NOT NULL,
    "color_min" DOUBLE PRECISION NOT NULL,
    "color_max" DOUBLE PRECISION NOT NULL,
    "ingredients" TEXT NOT NULL,
    "examples" TEXT NOT NULL,
    "style_guide" TEXT NOT NULL,

    CONSTRAINT "BeerStyle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BeerStyle" ADD CONSTRAINT "BeerStyle_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
