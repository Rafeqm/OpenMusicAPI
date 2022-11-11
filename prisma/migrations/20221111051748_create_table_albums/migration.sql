-- CreateTable
CREATE TABLE "albums" (
    "id" VARCHAR(50) NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);
