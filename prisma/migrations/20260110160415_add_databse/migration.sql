-- CreateEnum
CREATE TYPE "types" AS ENUM ('PDF', 'VIDEO');

-- CreateTable
CREATE TABLE "module" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "desc" VARCHAR(1000) NOT NULL,
    "price" INTEGER NOT NULL,
    "cover" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_content" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "type" "types" NOT NULL,
    "file_link" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "module_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enroll" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enroll_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "module_title_key" ON "module"("title");

-- AddForeignKey
ALTER TABLE "module" ADD CONSTRAINT "module_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module" ADD CONSTRAINT "module_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_content" ADD CONSTRAINT "module_content_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enroll" ADD CONSTRAINT "enroll_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enroll" ADD CONSTRAINT "enroll_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
