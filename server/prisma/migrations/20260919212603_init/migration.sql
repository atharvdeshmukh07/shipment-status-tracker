-- CreateTable
CREATE TABLE "shipments" (
    "id" UUID NOT NULL,
    "reference_no" TEXT NOT NULL,
    "reference_key" TEXT NOT NULL,
    "house_bl_no" TEXT,
    "master_bl_no" TEXT,
    "mode" TEXT NOT NULL,
    "origin_port" TEXT NOT NULL,
    "destination_port" TEXT NOT NULL,
    "consignee" TEXT NOT NULL,
    "incoterm" TEXT,
    "current_status" TEXT NOT NULL,
    "eta" DATE,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment_events" (
    "id" SERIAL NOT NULL,
    "shipment_id" UUID NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT NOT NULL,
    "remarks" TEXT,
    "actor" TEXT NOT NULL DEFAULT 'ops',
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipment_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shipments_reference_key_key" ON "shipments"("reference_key");

-- CreateIndex
CREATE INDEX "shipments_current_status_idx" ON "shipments"("current_status");

-- CreateIndex
CREATE INDEX "shipments_created_at_id_idx" ON "shipments"("created_at" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "shipment_events_shipment_id_occurred_at_id_idx" ON "shipment_events"("shipment_id", "occurred_at", "id");

-- AddForeignKey
ALTER TABLE "shipment_events" ADD CONSTRAINT "shipment_events_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
