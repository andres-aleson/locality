-- One-time setup on the shared Render Postgres, run as the database's admin
-- user (the same one MIGRATION_DATABASE_URL uses). Creates the `locality`
-- schema and a `locality_app` role for the app that can only read and write
-- rows in it. Replace the password before running.
--
--   psql "$MIGRATION_DATABASE_URL" -f scripts/setup-db.sql

create schema if not exists locality;

create role locality_app with login password 'CHANGE_ME';
alter role locality_app set search_path = locality;

grant usage on schema locality to locality_app;
grant select, insert, update, delete on all tables in schema locality to locality_app;
grant usage, select on all sequences in schema locality to locality_app;

-- Tables created later by drizzle-kit migrations (run as this admin user)
-- get the same grants automatically.
alter default privileges in schema locality
  grant select, insert, update, delete on tables to locality_app;
alter default privileges in schema locality
  grant usage, select on sequences to locality_app;
