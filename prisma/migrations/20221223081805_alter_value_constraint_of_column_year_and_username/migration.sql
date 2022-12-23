/*
  Warnings:

  - You are about to alter the column `year` on the `albums` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `year` on the `songs` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `username` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(25)`.

*/
-- AlterTable
ALTER TABLE "albums" ALTER COLUMN "year" SET DATA TYPE SMALLINT;

-- AlterTable
ALTER TABLE "songs" ALTER COLUMN "year" SET DATA TYPE SMALLINT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "username" SET DATA TYPE VARCHAR(25);
