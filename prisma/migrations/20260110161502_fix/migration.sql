/*
  Warnings:

  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `module` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `type` on the `module_content` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'INSTRUCTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Type" AS ENUM ('PDF', 'VIDEO');

-- DropForeignKey
ALTER TABLE "enroll" DROP CONSTRAINT "enroll_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "module" DROP CONSTRAINT "module_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "module" DROP CONSTRAINT "module_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "module_content" DROP CONSTRAINT "module_content_moduleId_fkey";

-- AlterTable
ALTER TABLE "module_content" DROP COLUMN "type",
ADD COLUMN     "type" "Type" NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'STUDENT';

-- DropTable
DROP TABLE "module";

-- DropEnum
DROP TYPE "roles";

-- DropEnum
DROP TYPE "types";

-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "desc" VARCHAR(1000) NOT NULL,
    "price" INTEGER NOT NULL,
    "cover" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "modules_title_key" ON "modules"("title");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_content" ADD CONSTRAINT "module_content_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enroll" ADD CONSTRAINT "enroll_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
