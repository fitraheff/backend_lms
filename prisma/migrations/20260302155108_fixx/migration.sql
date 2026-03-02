/*
  Warnings:

  - Added the required column `desc` to the `module_content` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "module_content" ADD COLUMN     "desc" VARCHAR(1000) NOT NULL;
