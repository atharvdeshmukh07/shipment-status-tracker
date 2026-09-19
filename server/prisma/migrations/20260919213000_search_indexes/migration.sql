-- Prefix search runs as reference_key LIKE 'NGKIMP2026%'. A plain btree index
-- is no help there unless the database is running in the C collation, which it
-- is not, so these are the pattern_ops variants that do get used.
-- Prisma has no way to express this in schema.prisma, so it lives in its own
-- migration made with --create-only.

CREATE INDEX "shipments_reference_key_pattern" ON "shipments" ("reference_key" text_pattern_ops);
CREATE INDEX "shipments_house_bl_no_pattern" ON "shipments" ("house_bl_no" text_pattern_ops);
