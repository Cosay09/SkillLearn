-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verified_at" TIMESTAMP(3),
ADD COLUMN     "verify_token_expiry" TIMESTAMP(3),
ADD COLUMN     "verify_token_hash" TEXT;
