/*
  Warnings:

  - You are about to drop the `UserRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "USER_ROLE" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "roles" "USER_ROLE" NOT NULL DEFAULT 'STUDENT';

-- DropTable
DROP TABLE "UserRole";
