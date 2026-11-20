# Punto P — local development
#
# Requirements (one-time):
#   1. Docker Desktop installed and running
#   2. npm install            (installs the Supabase CLI as a dev dependency)
#   3. npx supabase init       (creates supabase/config.toml — keep the migrations)
#
# Day-to-day:
#   make db       -> start the local database (Docker)
#   make dev      -> run the site against the local database
#   make reset    -> wipe + rebuild the local DB from migrations + seed
#   make status   -> show local URLs and keys
#   make stop     -> stop the local database

.PHONY: help db stop reset status dev build

help:
	@echo "make db      - start local Supabase (Postgres + Auth + Studio) in Docker"
	@echo "make dev     - run the frontend against the local database"
	@echo "make reset   - wipe and rebuild the local DB from migrations + seed"
	@echo "make status  - print local URLs and keys (Studio, API, anon key)"
	@echo "make stop    - stop local Supabase"
	@echo "make build   - production build (uses .env.production)"

db:
	npx supabase start

stop:
	npx supabase stop

reset:
	npx supabase db reset

status:
	npx supabase status

dev:
	npm run dev

build:
	npm run build
