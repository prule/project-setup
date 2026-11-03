---
name: vssw-generate-db-migration
description: >
  Generates a zero-downtime Postgres migration in the project's own migration
  tool: Supabase CLI migrations (with Row Level Security) or Flyway for a Spring
  Boot service. Use this skill when asked to create, modify, or drop database
  tables, columns, indexes or constraints.
---

# Generate DB Migration Skill

Full rules: `docs/constitution/technologies/supabase.md` and `docs/constitution/technologies/spring-boot-kotlin.md`.

## 1. Find the stack first

| The repo has | Tool | New file |
|---|---|---|
| `supabase/` | Supabase CLI | `supabase migration new <name>` → `supabase/migrations/<timestamp>_<name>.sql` |
| Flyway in the Gradle build | Flyway | `src/main/resources/db/migration/V<timestamp>__<name>.sql` |

Neither: ask. Never write Flyway files in a Supabase project, or the reverse.

## 2. Naming and standard columns
- Tables `snake_case` and plural (`user_accounts`); columns `snake_case`.
- Every new table: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
- `DEFAULT now()` sets `updated_at` only on insert. Say what keeps it current: a `BEFORE UPDATE` trigger (Supabase), or the repository setting it on save (Spring).

## 3. Supabase: Row Level Security in the same migration
Every new table enables RLS and gets its policies in the migration that creates it — never "later". This is the whole security model (`docs/constitution/principles/least-privilege.md`).

```sql
alter table public.notes enable row level security;
create policy "owners read their notes" on public.notes
  for select using (auth.uid() = owner_id);
```

Schema changes only ever go through migration files, never the dashboard.

## 4. Zero downtime: expand, then contract
The old code keeps running while the migration applies, so a migration must work with both versions.

- **Rename, retype or drop a column:** add the new column; tell the user to deploy code that writes both and reads the new one; drop the old one in a later migration.
- **Add a `NOT NULL` column:** add it nullable or with a default, backfill, then add `NOT NULL` in a later migration.
- **Add an index on a live table:** `CREATE INDEX CONCURRENTLY`. It cannot run in a transaction: in Flyway, put it alone in a migration with `-- flyway:executeInTransaction=false` on line 1; in Supabase, alone in its own migration file.
- **Add a foreign key or check:** `ADD CONSTRAINT … NOT VALID`, then `VALIDATE CONSTRAINT` in a later migration, so the table is not locked while every row is checked.

## 5. Migrations are immutable
Never edit a migration that has been merged or applied: Flyway checksums it and Supabase records it, so an edit breaks every environment that ran it. Correct a mistake with a new migration. Forward-only: no undo scripts.

## Smells
A Flyway file under `supabase/`, a table without `enable row level security`, `DROP COLUMN` in the same release as the code change, `CREATE INDEX` without `CONCURRENTLY` on a populated table, an edited applied migration, `updated_at` that never changes.
