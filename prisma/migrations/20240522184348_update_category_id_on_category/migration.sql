/*
  Warnings:

  - Added the required column `category_id` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "category_id" INTEGER NOT NULL;
