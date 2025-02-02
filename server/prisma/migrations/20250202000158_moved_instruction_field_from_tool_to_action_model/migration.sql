/*
  Warnings:

  - You are about to drop the column `instruction` on the `Tool` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[description]` on the table `Action` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[instruction]` on the table `Action` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `Action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instruction` to the `Action` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Tool_instruction_key";

-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "instruction" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tool" DROP COLUMN "instruction";

-- CreateIndex
CREATE UNIQUE INDEX "Action_description_key" ON "Action"("description");

-- CreateIndex
CREATE UNIQUE INDEX "Action_instruction_key" ON "Action"("instruction");
