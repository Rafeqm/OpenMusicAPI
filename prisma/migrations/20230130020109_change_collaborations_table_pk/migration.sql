/*
  Warnings:

  - The primary key for the `collaborations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `collaborations` table. All the data in the column will be lost.

*/

-- DropIndex
DROP INDEX "collaborations_playlist_id_user_id_key";

-- AlterTable
ALTER TABLE "collaborations" DROP CONSTRAINT "collaborations_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "collaborations_pkey" PRIMARY KEY ("playlist_id", "user_id");
