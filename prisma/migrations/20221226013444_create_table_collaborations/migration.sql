-- CreateTable
CREATE TABLE "collaborations" (
    "id" VARCHAR(50) NOT NULL,
    "playlist_id" VARCHAR(50) NOT NULL,
    "user_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "collaborations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collaborations_playlist_id_user_id_key" ON "collaborations"("playlist_id", "user_id");

-- AddForeignKey
ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
