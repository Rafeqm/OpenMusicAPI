-- CreateTable
CREATE TABLE "favorite_songs" (
    "user_id" VARCHAR(50) NOT NULL,
    "song_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "favorite_songs_pkey" PRIMARY KEY ("user_id","song_id")
);

-- AddForeignKey
ALTER TABLE "favorite_songs" ADD CONSTRAINT "favorite_songs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_songs" ADD CONSTRAINT "favorite_songs_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
