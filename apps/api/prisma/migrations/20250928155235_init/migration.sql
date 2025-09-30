-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'EDITOR');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'EDITOR',
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Sector" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL,

    CONSTRAINT "Sector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Exhibitor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "description" TEXT,
    "websiteUrl" TEXT,
    "linkedinUrl" TEXT,
    "pdfUrl" TEXT,
    "sectorId" TEXT NOT NULL,
    "boothId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exhibitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Booth" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "polygonId" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "rotation" DOUBLE PRECISION DEFAULT 0,
    "polygonPoints" TEXT,

    CONSTRAINT "Booth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Contact" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "exhibitorId" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Theme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Favorite" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exhibitorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sessionId" TEXT,
    "exhibitorId" TEXT,
    "searchQuery" TEXT,
    "payload" JSONB NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ExhibitorThemes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ExhibitorThemes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Sector_name_key" ON "public"."Sector"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Exhibitor_slug_key" ON "public"."Exhibitor"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Exhibitor_boothId_key" ON "public"."Exhibitor"("boothId");

-- CreateIndex
CREATE INDEX "Exhibitor_name_idx" ON "public"."Exhibitor"("name");

-- CreateIndex
CREATE INDEX "Exhibitor_slug_idx" ON "public"."Exhibitor"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Booth_number_key" ON "public"."Booth"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Booth_polygonId_key" ON "public"."Booth"("polygonId");

-- CreateIndex
CREATE INDEX "Booth_polygonId_idx" ON "public"."Booth"("polygonId");

-- CreateIndex
CREATE INDEX "Booth_number_idx" ON "public"."Booth"("number");

-- CreateIndex
CREATE INDEX "Booth_x_y_idx" ON "public"."Booth"("x", "y");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_name_key" ON "public"."Theme"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_slug_key" ON "public"."Theme"("slug");

-- CreateIndex
CREATE INDEX "Theme_slug_idx" ON "public"."Theme"("slug");

-- CreateIndex
CREATE INDEX "Favorite_sessionId_idx" ON "public"."Favorite"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_sessionId_exhibitorId_key" ON "public"."Favorite"("sessionId", "exhibitorId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_createdAt_idx" ON "public"."AnalyticsEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_idx" ON "public"."AnalyticsEvent"("sessionId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_exhibitorId_idx" ON "public"."AnalyticsEvent"("exhibitorId");

-- CreateIndex
CREATE INDEX "_ExhibitorThemes_B_index" ON "public"."_ExhibitorThemes"("B");

-- AddForeignKey
ALTER TABLE "public"."Exhibitor" ADD CONSTRAINT "Exhibitor_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "public"."Sector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exhibitor" ADD CONSTRAINT "Exhibitor_boothId_fkey" FOREIGN KEY ("boothId") REFERENCES "public"."Booth"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contact" ADD CONSTRAINT "Contact_exhibitorId_fkey" FOREIGN KEY ("exhibitorId") REFERENCES "public"."Exhibitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_exhibitorId_fkey" FOREIGN KEY ("exhibitorId") REFERENCES "public"."Exhibitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ExhibitorThemes" ADD CONSTRAINT "_ExhibitorThemes_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Exhibitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ExhibitorThemes" ADD CONSTRAINT "_ExhibitorThemes_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

