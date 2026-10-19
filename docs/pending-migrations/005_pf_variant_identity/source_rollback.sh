#!/bin/sh
# Reverts the 005 source patches (run from the project root, only after 99_rollback.sql).
set -e
patch -p1 -R < docs/pending-migrations/005_pf_variant_identity/frontend.patch
patch -p1 -R < docs/pending-migrations/005_pf_variant_identity/sync.patch
