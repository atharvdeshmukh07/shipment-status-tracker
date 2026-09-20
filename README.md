[![CI](https://github.com/atharvdeshmukh07/shipment-status-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/atharvdeshmukh07/shipment-status-tracker/actions/workflows/ci.yml)

# Shipment Status Tracker

Tracks import shipments through the stages a freight forwarder actually moves
them through, keeping the full history of how each file got where it is rather
than only its current state.

**Live**

| | |
|---|---|
| Web | https://shipment-status-tracker-five.vercel.app |
| API | https://shipment-tracker-api-gpkw.onrender.com |
| Health | https://shipment-tracker-api-gpkw.onrender.com/health |

The API is on Render's free tier, which sleeps after fifteen minutes idle. The
first request after a quiet spell takes about a minute to answer. Open the health
URL once before the web app and it will be awake.

## What it does

- Open a file against a reference number, consignee, lane and mode
- See every file on one board, with counts by state, filtered by status, and
  searched by reference or house B/L
- Open one file to see where it is on its run, how long it has been sitting
  there, and its complete history
- Move a file on, with the server refusing any move that does not make sense

## The stages

Eleven, not the four in the brief's example. The example includes Customs Hold,
which is an import clearance idea rather than a courier one, so the stages here
are the ones a CHA desk would actually tick off:

`BOOKED → DOCS_RECEIVED → IN_TRANSIT → ARRIVED_AT_PORT → CUSTOMS_FILED →
CLEARED → OUT_FOR_DELIVERY → DELIVERED`

with three that sit off that line:

- **CUSTOMS_HOLD** — reached from `CUSTOMS_FILED`, and it loops back there after
  an examination rather than being a dead end, because that is what happens
- **EXCEPTION** — reachable from anywhere. Its exit is not fixed: the server
  works out where the file broke from by reading the last event that put it into
  exception, and only allows it back there
- **CANCELLED** — only before the goods are in transit

Every transition is checked server-side. An illegal move comes back `409` with
the list of moves that *are* legal from where the file actually is, and the UI
builds its dropdown from that list, so it never offers something that will be
refused. `CUSTOMS_HOLD` and `EXCEPTION` require a reason.

## Data model

Two tables, not one.

`shipments` holds the current state. `shipment_events` is append-only — there is
no update or delete path to it anywhere in the API, which is the whole point of
keeping it separate. Creating a file writes an event too, so a brand new
shipment has a history rather than an empty timeline that looks broken.

`shipments.current_status` duplicates the last event so the board does not need
a join per row. Both writes go in one transaction, so it cannot drift.

Two other columns earn their place:

- **`reference_key`** — the reference with punctuation and case stripped
  (`NGK/IMP/2026/0431` → `NGKIMP20260431`). It carries the unique constraint and
  it is what search runs against, so `ngk-imp-2026-0431` finds the same file.
- **`version`** — bumped on every status change and checked inside the `WHERE`
  clause of the update, not in an `if` above it. Two people clicking at the same
  moment both read version 4; with a read-then-write the second one wins and
  nobody finds out. Here the second gets a `409` telling them to refresh.

## Stack and why

| | | |
|---|---|---|
| API | Express 5, TypeScript | Express 5 forwards rejected promises to the error handler itself, so the routes have no try/catch that only rethrows |
| Validation | Zod | One schema validates the body and types it, so the two cannot drift apart |
| Database | PostgreSQL on Neon | Free tier, and the transaction guarantees the two-table write depends on |
| ORM | Prisma 6 | Typed queries; the list endpoint drops to raw SQL where the filter/search/sort combination is clearer written out |
| Web | React 19, Vite, TypeScript | |
| Data fetching | TanStack Query | Cache invalidation after a mutation without hand-rolling it |
| Styling | Tailwind 4 | Theme lives in a `@theme` block in CSS — there is no config file in v4 |
| Hosting | Render (API), Vercel (web) | Separate platforms, as asked |

## Running it locally

You need Node 22 and a Postgres database. Neon's free tier is the quickest.

```bash
git clone https://github.com/atharvdeshmukh07/shipment-status-tracker.git
cd shipment-status-tracker
```

**API**

```bash
cd server
npm install
cp .env.example .env          # put your connection strings in
npx prisma migrate deploy
npm run seed                  # 12 realistic import jobs with history
npm run dev                   # :4000
```

`DATABASE_URL` is Neon's pooled string with `?pgbouncer=true&connection_limit=1`
on it; `DIRECT_URL` is the unpooled one, because migrations cannot run through
pgbouncer.

**Web**

```bash
cd client
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:4000
npm run dev                   # :5173
```

There is a `docker-compose.yml` at the root that spins up a Postgres container
if you would rather not use a hosted one. I developed against Neon and did not
run the compose file, so treat it as a convenience rather than a tested path —
the `.env.example` values match it.

**Checks**

```bash
cd server && npm run typecheck && npm test
```

21 tests, all on the transition rules and reference normalisation. They run on
every push via GitHub Actions.

`server/requests.http` exercises every endpoint with the VS Code REST Client
extension, including the four cases that should fail: an illegal jump, a hold
with no reason, a stale version, and a duplicate reference.

## API

Base: `/api/v1`

| | | |
|---|---|---|
| `POST` | `/shipments` | Open a file. `409` on a duplicate reference |
| `GET` | `/shipments` | `?status=` `?q=` `?limit=` `?offset=` `?sort=` `?dir=` |
| `GET` | `/shipments/:id` | Includes `nextStatuses` — the moves legal from here |
| `GET` | `/shipments/:id/events` | Full history, oldest first |
| `POST` | `/shipments/:id/status` | Move it. Needs `expectedVersion` |

Errors come back in one shape, with a code the client can act on rather than a
stack trace: `VALIDATION_FAILED` (422), `NOT_FOUND` (404),
`DUPLICATE_REFERENCE`, `ILLEGAL_TRANSITION`, `VERSION_CONFLICT` (all 409).

Three of those are 409s deliberately. "Someone else moved this" is fixed by
refetching; "you cannot go there from here" never is; and the client needs to
tell them apart to know whether retrying is worth anything.

## Assumptions

- Single desk, no auth. Every event records an actor, defaulted to `ops`, so
  adding real users later is a column being populated rather than a migration.
- Reference numbers are unique across the whole book, not per customer.
- The ETA is a date, not a timestamp. A delivery due on the 14th is due on the
  14th wherever you read it from, so it never passes through a JS `Date` on the
  way out.
- One shipment, one house B/L. Consolidations under one master B/L would need a
  third table.
- Times are stored as `timestamptz` and shown in the reader's own timezone.

## 10,000 shipments and several people on it at once

Nothing about the shape changes. The two-table design and the version column
were both chosen with this in mind, and at ten thousand rows Postgres is not
breathing hard — what gives first is the offset pagination, which gets slower
the deeper you page, so I would move the board to keyset pagination on
`(created_at, id)`; the tiebreak is already in the `ORDER BY` for exactly that
reason. The four filtered counts along the top would become one `GROUP BY
current_status`, cached for a few seconds, rather than four round trips per
page load. Concurrent writes are already handled honestly: two people moving
the same file both send the version they read, the second one loses in the
`WHERE` clause and is told so rather than silently overwriting the first —
that is the part most implementations get wrong and it costs nothing to get
right up front. Beyond that I would put the event table on a monthly partition
since it only ever grows, move Render off the free tier so it stops sleeping,
and run the API on more than one instance, which it already tolerates because
it holds no state between requests.

## The rest of it, in more detail

The board and the search are the first things to feel it. `reference_key` and
`house_bl_no` already carry `text_pattern_ops` indexes so prefix search uses
them rather than scanning — that is a hand-written migration, because Prisma's
schema language cannot express an operator class.

Past that:

- **Offset pagination gets slow** at depth. Keyset pagination on
  `(created_at, id)` — the tiebreak is already in the `ORDER BY` for this reason.
- **The event table only grows.** Partition by month, or move anything closed
  and over a year old to cold storage. Nothing reads old events except the
  detail page.
- **The counts on the board** are four filtered counts today. One `GROUP BY
  current_status` replaces them the moment that stops being cheap.
- **Write contention** is already handled by the version column, and it degrades
  honestly — the loser is told, rather than silently losing their change.
- **Status changes want to notify.** The event table is the natural outbox; a
  worker tailing it could email the consignee on `CLEARED` without the API
  knowing anything about email.

## Notes while building

`DECISIONS.md` is the running log I kept — the design calls, and the two things
that went wrong (a migration ordering problem, and a deploy that needed its root
directory pointed at `server`). It is dated and in my own words.
