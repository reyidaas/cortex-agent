/*
  Warnings:

  - Added the required column `name` to the `Memory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Memory" ADD COLUMN     "name" TEXT NOT NULL;
