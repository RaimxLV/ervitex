# 009 applied — 2026-10-21 14:39 UTC

- Approved file unchanged: `docs/pending-migrations/009_regular_price_retention/01_apply.sql`, MD5 `d32594cd2e0aecace6068a57f8f69272`, 3209 bytes.
- Staged as `public.migration_stage.name = 009_regular_price_retention`; generated checksum verified before execution.
- Prior definitions captured in `009_before_refresh` and `009_before_view`; prior ACL, security options, materialized-view definition and price hashes in `009_before_checks`.
- Applied in one transaction via `drizzle/migrations/0025_mf_009_surgical_regular_price_retention.sql`; both original definition guards retained and passed. No refresh invocation.
- Post refresh MD5: `30443c048c0c493a2630621ad46a87e6`.
- Post view MD5: `e9797e96504448bdd4ee1ab864c29231`.
- Read-only reverse comparison: refresh contains only reviewed hold/comment changes; view contains only reviewed MF outlet removal (formatting/parenthesis normalization accounted for).

## Security preservation correction

The approved `CREATE OR REPLACE VIEW` cleared the pre-existing `security_invoker=true` option. Post-check detected it; guarded migration `0026_mf_009_preserve_existing_view_security.sql` restored only that existing option. This was a separate safety correction, not part of the exact 009 transaction. Approved SQL bytes and resulting definition were not changed. Final comparison confirms original ACLs, security_invoker, underlying materialized-view definition and both price hashes unchanged.

## Final read-only evidence

- Refresh EXECUTE remains postgres/service_role-only; view ACL unchanged.
- Underlying materialized-view MD5 unchanged: `eb93dcfb70765383d2113f6b420c58dd`.
- Existing published/manual-hidden and footwear gates retained; NWG/F&R price-presence and UTT filters unchanged.
- All variant-price rows hash unchanged: `29870bceac4a6b8344e595d0bf34b79e`.
- All price-range rows hash unchanged: `b02a2daf7194b49351f20c0ef6d9dd54`.
- MF139 public rows remain 64; 24 unknown outlet prices were not restored.
- No sync/refresh invocation, repricing, other supplier deployment or frontend publication.
- MF139 missing normal-price evidence and other suppliers' unverified promo/removal semantics remain open as previously documented.