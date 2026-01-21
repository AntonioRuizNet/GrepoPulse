-- CreateEnum
CREATE TYPE "KillType" AS ENUM ('all', 'att', 'def');

-- CreateTable
CREATE TABLE "World" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "World_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Snapshot" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'running',
    "durationMs" INTEGER,
    "notes" TEXT,

    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSetting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "passwordHash" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "worldId" TEXT NOT NULL,
    "playerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "allianceId" INTEGER,
    "towns" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("worldId","playerId")
);

-- CreateTable
CREATE TABLE "PlayerRankSnapshot" (
    "snapshotId" TEXT NOT NULL,
    "playerId" INTEGER NOT NULL,
    "points" BIGINT NOT NULL,
    "rank" INTEGER NOT NULL,
    "towns" INTEGER NOT NULL,

    CONSTRAINT "PlayerRankSnapshot_pkey" PRIMARY KEY ("snapshotId","playerId")
);

-- CreateTable
CREATE TABLE "PlayerKillSnapshot" (
    "snapshotId" TEXT NOT NULL,
    "playerId" INTEGER NOT NULL,
    "type" "KillType" NOT NULL,
    "rank" INTEGER NOT NULL,
    "points" BIGINT NOT NULL,

    CONSTRAINT "PlayerKillSnapshot_pkey" PRIMARY KEY ("snapshotId","playerId","type")
);

-- CreateTable
CREATE TABLE "Alliance" (
    "worldId" TEXT NOT NULL,
    "allianceId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alliance_pkey" PRIMARY KEY ("worldId","allianceId")
);

-- CreateTable
CREATE TABLE "AllianceRankSnapshot" (
    "snapshotId" TEXT NOT NULL,
    "allianceId" INTEGER NOT NULL,
    "points" BIGINT NOT NULL,
    "villages" INTEGER NOT NULL,
    "members" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "AllianceRankSnapshot_pkey" PRIMARY KEY ("snapshotId","allianceId")
);

-- CreateTable
CREATE TABLE "AllianceKillSnapshot" (
    "snapshotId" TEXT NOT NULL,
    "allianceId" INTEGER NOT NULL,
    "type" "KillType" NOT NULL,
    "rank" INTEGER NOT NULL,
    "points" BIGINT NOT NULL,

    CONSTRAINT "AllianceKillSnapshot_pkey" PRIMARY KEY ("snapshotId","allianceId","type")
);

-- CreateTable
CREATE TABLE "Town" (
    "worldId" TEXT NOT NULL,
    "townId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "islandX" INTEGER NOT NULL,
    "islandY" INTEGER NOT NULL,
    "numberOnIsland" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Town_pkey" PRIMARY KEY ("worldId","townId")
);

-- CreateTable
CREATE TABLE "Island" (
    "worldId" TEXT NOT NULL,
    "islandId" INTEGER NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "islandType" INTEGER NOT NULL,
    "availableTowns" INTEGER NOT NULL,
    "resourcesAdvantage" INTEGER NOT NULL,
    "resourcesDisadvantage" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Island_pkey" PRIMARY KEY ("worldId","islandId")
);

-- CreateTable
CREATE TABLE "Conquer" (
    "worldId" TEXT NOT NULL,
    "townId" INTEGER NOT NULL,
    "time" BIGINT NOT NULL,
    "newPlayerId" INTEGER,
    "oldPlayerId" INTEGER,
    "newAllyId" INTEGER,
    "oldAllyId" INTEGER,
    "townPoints" INTEGER NOT NULL,

    CONSTRAINT "Conquer_pkey" PRIMARY KEY ("worldId","townId","time")
);

-- CreateIndex
CREATE INDEX "Snapshot_worldId_fetchedAt_idx" ON "Snapshot"("worldId", "fetchedAt");

-- CreateIndex
CREATE INDEX "Player_worldId_allianceId_idx" ON "Player"("worldId", "allianceId");

-- CreateIndex
CREATE INDEX "PlayerRankSnapshot_playerId_idx" ON "PlayerRankSnapshot"("playerId");

-- CreateIndex
CREATE INDEX "PlayerKillSnapshot_playerId_type_idx" ON "PlayerKillSnapshot"("playerId", "type");

-- CreateIndex
CREATE INDEX "AllianceRankSnapshot_allianceId_idx" ON "AllianceRankSnapshot"("allianceId");

-- CreateIndex
CREATE INDEX "AllianceKillSnapshot_allianceId_type_idx" ON "AllianceKillSnapshot"("allianceId", "type");

-- CreateIndex
CREATE INDEX "Town_worldId_playerId_idx" ON "Town"("worldId", "playerId");

-- CreateIndex
CREATE INDEX "Town_worldId_islandX_islandY_idx" ON "Town"("worldId", "islandX", "islandY");

-- CreateIndex
CREATE INDEX "Island_worldId_x_y_idx" ON "Island"("worldId", "x", "y");

-- CreateIndex
CREATE INDEX "Conquer_worldId_time_idx" ON "Conquer"("worldId", "time");

-- AddForeignKey
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerRankSnapshot" ADD CONSTRAINT "PlayerRankSnapshot_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerKillSnapshot" ADD CONSTRAINT "PlayerKillSnapshot_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alliance" ADD CONSTRAINT "Alliance_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllianceRankSnapshot" ADD CONSTRAINT "AllianceRankSnapshot_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllianceKillSnapshot" ADD CONSTRAINT "AllianceKillSnapshot_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Town" ADD CONSTRAINT "Town_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Island" ADD CONSTRAINT "Island_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conquer" ADD CONSTRAINT "Conquer_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;
