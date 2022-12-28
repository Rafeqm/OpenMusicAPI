-- CreateTable
CREATE TABLE "activities_on_playlist" (
    "playlist_id" VARCHAR(50) NOT NULL,
    "user_id" VARCHAR(50) NOT NULL,
    "song_id" VARCHAR(50) NOT NULL,
    "action" VARCHAR(10) NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_on_playlist_pkey" PRIMARY KEY ("song_id","action","time")
);

-- AddForeignKey
ALTER TABLE "activities_on_playlist" ADD CONSTRAINT "activities_on_playlist_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities_on_playlist" ADD CONSTRAINT "activities_on_playlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities_on_playlist" ADD CONSTRAINT "activities_on_playlist_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
