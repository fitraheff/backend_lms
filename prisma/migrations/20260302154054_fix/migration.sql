/*
  Warnings:

  - You are about to drop the column `file_link` on the `module_content` table. All the data in the column will be lost.
  - Added the required column `file_url` to the `module_content` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "module_content" DROP COLUMN "file_link",
ADD COLUMN     "file_url" TEXT NOT NULL;
