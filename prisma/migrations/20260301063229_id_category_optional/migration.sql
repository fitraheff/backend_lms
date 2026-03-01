-- DropForeignKey
ALTER TABLE "modules" DROP CONSTRAINT "modules_categoryId_fkey";

-- AlterTable
ALTER TABLE "modules" ALTER COLUMN "categoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
