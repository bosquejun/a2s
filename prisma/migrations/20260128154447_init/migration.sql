-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('CANT_SLEEP', 'DARK', 'MISS_SOMEONE', 'EMPTY', 'REFLECTIVE', 'UNSETTLING');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('HORROR', 'CONFESSION', 'ROMANCE', 'EXISTENTIAL', 'SURREAL');

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "mood" "Mood" NOT NULL,
    "categories" "Category"[],
    "tags" TEXT[],
    "intensity" INTEGER NOT NULL DEFAULT 3,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Story_slug_key" ON "Story"("slug");

-- CreateIndex
CREATE INDEX "Story_slug_idx" ON "Story"("slug");

-- CreateIndex
CREATE INDEX "Story_mood_idx" ON "Story"("mood");

-- CreateIndex
CREATE INDEX "Story_categories_idx" ON "Story"("categories");

-- CreateIndex
CREATE INDEX "Story_tags_idx" ON "Story"("tags");

-- CreateIndex
CREATE INDEX "Story_approved_idx" ON "Story"("approved");

-- CreateIndex
CREATE INDEX "Story_intensity_idx" ON "Story"("intensity");

-- CreateIndex
CREATE INDEX "Story_publishedAt_idx" ON "Story"("publishedAt");

-- CreateIndex
CREATE INDEX "Story_updatedAt_idx" ON "Story"("updatedAt");
