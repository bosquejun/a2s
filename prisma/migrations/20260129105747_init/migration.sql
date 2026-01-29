-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('CANT_SLEEP', 'DARK', 'MISS_SOMEONE', 'EMPTY', 'REFLECTIVE', 'UNSETTLING');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('HORROR', 'CONFESSION', 'ROMANCE', 'EXISTENTIAL', 'SURREAL');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'REJECTED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StoryRequestStatus" AS ENUM ('PENDING', 'REJECTED', 'APPROVED', 'FAILED');

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "excerpt" TEXT,
    "mood" "Mood" NOT NULL,
    "categories" "Category"[],
    "tags" TEXT[],
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "readTime" INTEGER NOT NULL DEFAULT 0,
    "intensity" INTEGER NOT NULL DEFAULT 3,
    "notes" TEXT,
    "seo" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "storyRequestId" TEXT,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryRequest" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "StoryRequestStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "trackCode" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Story_slug_key" ON "Story"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Story_storyRequestId_key" ON "Story"("storyRequestId");

-- CreateIndex
CREATE INDEX "Story_slug_idx" ON "Story"("slug");

-- CreateIndex
CREATE INDEX "Story_mood_idx" ON "Story"("mood");

-- CreateIndex
CREATE INDEX "Story_categories_idx" ON "Story"("categories");

-- CreateIndex
CREATE INDEX "Story_tags_idx" ON "Story"("tags");

-- CreateIndex
CREATE INDEX "Story_intensity_idx" ON "Story"("intensity");

-- CreateIndex
CREATE INDEX "Story_publishedAt_idx" ON "Story"("publishedAt");

-- CreateIndex
CREATE INDEX "Story_updatedAt_idx" ON "Story"("updatedAt");

-- CreateIndex
CREATE INDEX "Story_readTime_idx" ON "Story"("readTime");

-- CreateIndex
CREATE UNIQUE INDEX "StoryRequest_trackCode_key" ON "StoryRequest"("trackCode");

-- CreateIndex
CREATE INDEX "StoryRequest_status_idx" ON "StoryRequest"("status");

-- CreateIndex
CREATE INDEX "StoryRequest_createdAt_idx" ON "StoryRequest"("createdAt");

-- CreateIndex
CREATE INDEX "StoryRequest_updatedAt_idx" ON "StoryRequest"("updatedAt");

-- CreateIndex
CREATE INDEX "StoryRequest_trackCode_idx" ON "StoryRequest"("trackCode");

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_storyRequestId_fkey" FOREIGN KEY ("storyRequestId") REFERENCES "StoryRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
