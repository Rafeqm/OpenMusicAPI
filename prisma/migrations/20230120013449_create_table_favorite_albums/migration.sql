-- CreateTable
CREATE TABLE "favorite_albums" (
    "user_id" VARCHAR(50) NOT NULL,
    "album_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "favorite_albums_pkey" PRIMARY KEY ("user_id","album_id")
);

-- AddForeignKey
ALTER TABLE "favorite_albums" ADD CONSTRAINT "favorite_albums_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_albums" ADD CONSTRAINT "favorite_albums_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;
