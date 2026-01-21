-- CreateTable
CREATE TABLE "activity_traces" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "activity_traces_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_traces_activityId_idx" ON "activity_traces"("activityId");

-- AddForeignKey
ALTER TABLE "activity_traces" ADD CONSTRAINT "activity_traces_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "stock_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
