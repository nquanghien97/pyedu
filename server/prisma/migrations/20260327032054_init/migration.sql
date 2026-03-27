/*
  Warnings:

  - Added the required column `updatedAt` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Made the column `isAiGenerated` on table `Exercise` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `ExerciseQuestion` table without a default value. This is not possible if the table is not empty.
  - Made the column `autoGrade` on table `ExerciseQuestion` required. This step will fail if there are existing NULL values in that column.
  - Made the column `aiGradingEnabled` on table `ExerciseQuestion` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ExerciseQuestion" DROP CONSTRAINT "ExerciseQuestion_exerciseId_fkey";

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "isAiGenerated" SET NOT NULL,
ALTER COLUMN "isAiGenerated" SET DEFAULT false,
ALTER COLUMN "status" SET DEFAULT 'draft';

-- AlterTable
ALTER TABLE "ExerciseQuestion" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "autoGrade" SET NOT NULL,
ALTER COLUMN "autoGrade" SET DEFAULT false,
ALTER COLUMN "aiGradingEnabled" SET NOT NULL,
ALTER COLUMN "aiGradingEnabled" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "ExerciseAttachment" (
    "id" CHAR(36) NOT NULL,
    "exerciseId" CHAR(36) NOT NULL,
    "questionId" CHAR(36),
    "fileName" VARCHAR(255) NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "publicId" VARCHAR(255),
    "fileType" VARCHAR(100) NOT NULL,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseAttachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExerciseQuestion" ADD CONSTRAINT "ExerciseQuestion_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseAttachment" ADD CONSTRAINT "ExerciseAttachment_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseAttachment" ADD CONSTRAINT "ExerciseAttachment_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ExerciseQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
