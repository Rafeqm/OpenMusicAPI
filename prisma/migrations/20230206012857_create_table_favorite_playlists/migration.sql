-- CreateTable
CREATE TABLE "favorite_playlists" (
    "user_id" VARCHAR(50) NOT NULL,
    "playlist_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "favorite_playlists_pkey" PRIMARY KEY ("user_id","playlist_id")
);

-- AddForeignKey
ALTER TABLE "favorite_playlists" ADD CONSTRAINT "favorite_playlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_playlists" ADD CONSTRAINT "favorite_playlists_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
