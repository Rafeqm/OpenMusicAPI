-- CreateTable
CREATE TABLE "socials" (
    "follower_id" VARCHAR(50) NOT NULL,
    "followee_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "socials_pkey" PRIMARY KEY ("follower_id","followee_id")
);

-- AddForeignKey
ALTER TABLE "socials" ADD CONSTRAINT "socials_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "socials" ADD CONSTRAINT "socials_followee_id_fkey" FOREIGN KEY ("followee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
