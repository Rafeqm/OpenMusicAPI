-- CreateTable
CREATE TABLE "songs" (
    "id" VARCHAR(50) NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "performer" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "duration" INTEGER,
    "album_id" VARCHAR(50),

    CONSTRAINT "songs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE SET NULL ON UPDATE CASCADE;
