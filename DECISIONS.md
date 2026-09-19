Notes to myself while building this. Newest at the bottom.

## 19 Sep, evening

Two tables, not one. Thought about keeping a `status` column on the shipment
and a history table that only records changes, but then the first status has no
row in it and the timeline starts out empty, which looks broken. So creation
writes an event too, and the shipment's `current_status` is a copy of the last
event for the sake of the list page. Both writes go in one transaction.

Eleven stages instead of the four in their example. Their example has Customs
Hold in it, which is an import clearance idea, so they are thinking CHA and not
courier. Added the stages either side of it that a desk would actually tick off:
docs received, arrived at port, BE filed, cleared, out for delivery.

Customs hold loops back to customs filed rather than being a dead end. That is
what actually happens after an examination.

Ran into a migration ordering problem on the first `prisma migrate dev`. The
search-index migration was sitting in the folder with an earlier timestamp
than the init migration that actually creates the tables, so Postgres tried
to add indexes onto `shipments` before the table existed. Fixed by pulling
that migration out, running init on its own, then dropping the index
migration back in with a timestamp after init and re-applying it.

Also noticed Prisma flags that same index migration as drift every time
`migrate dev` runs, because `text_pattern_ops` isn't something the schema
file can express — it only exists as raw SQL. Expected, not a bug. Declining
the prompt to generate a reconciling migration when it comes up.
