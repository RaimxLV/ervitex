# Architecture rules

- All search entry points share searchScore and exactCodeHits so brand priority and exact-code narrowing stay consistent.

- Public informational icons use shared AccentIcon framed/inline variants and semantic tone options; print-specific Lucide-compatible symbols live in print-icons, keeping stroke weight and sizes consistent.
- Public section eyebrows use one red line-label style; blue/cyan/green/slate remain icon-only, and technology use cases sit in a light centered panel for visual continuity.

- Office-photo image, individual pane/door SVG contours and clipped accessible hotspots share original-photo coordinates in one cover-sized scene; matching geometry prevents hover fills and keeps annotations aligned across screen sizes. The luminous halo is a separate blurred polygon layer using an SVG feGaussianBlur filter with an oversized filter region, because CSS drop-shadow blur is clipped by each shape's own bounding box and reads as a thin line instead of light.

- Quote worksheet edits use side-specific autosaved drafts; only explicit confirmation updates the shared list and creates an immutable version, preventing incomplete client/staff edits from overwriting each other.
- Quote workflow history is append-only in `quote_events`; assignment and status changes must remain visible even when the current quote row changes.
- Client communication stays in normal email; the worksheet only edits and confirms products, then copies a reusable HTML/plain-text burgundy list link for email replies, maximizing compatibility across mail clients and dark mode.
- NWG syncs are resumable; catalog refresh and price audit apply the same brand-specific discount and markup to list prices, with purchase price fallback only when list price is missing, preventing repricing drift.
- Catalog cards default to the cheapest positive-priced colour and product views select its cheapest size via shared catalogPriceSelection helpers; explicit colour/size choices take precedence, keeping card and detail prices aligned.
- "Ir noliktavā" is a manual admin flag in `stock_flags` per colour (`item_id` = `${id}::${color_code}`; bare `${id}` rows are legacy model-wide flags), separate from supplier data so syncs never erase it; it shows only in the product view for the selected colour, never on catalog cards; worksheet discount lives in `quote_requests.worksheet_discount` via admin-only RPC so it never enters client drafts.
- Shared worksheet printing costs use `PrintLine.scope = "order"` inside the existing side-specific item drafts, preserving autosave/version behavior without a second persistence path.
- Stock mutation controls render only after the authenticated admin role resolves, and every mutation revalidates the live user and role before writing; public users only see the outlined availability label.
- Public pages (not admin/worksheet/login) use Lenis wheel smoothing on fine-pointer devices and native touch scrolling; its WebGL hero depth reacts to scroll and, on fine-pointer devices, to eased mouse movement, renders only while values change and pauses off-screen, balancing visible depth with smooth performance.
- Supplier purchase/wholesale price columns are excluded from anon/authenticated column GRANTs and internal SECURITY DEFINER helpers are service_role-only, so public catalog reads can never leak our buying prices or trigger syncs.
- Per-route title/description/canonical/robots are set client-side by `RouteSeo`; private token and admin routes are always noindex.
- Old phone/home-screen installs: sw.js and service-worker.js are self-unregistering kill-switches; never delete them, because a 404 leaves stale service workers serving broken cached pages.
- The homepage technology mosaic derives its photo pool from all `techs` galleries, loads images near the viewport, decodes replacements before fading, and pauses timers off-screen/in hidden tabs, during pointer/keyboard interaction or image dialogs, and for reduced motion; this keeps the gallery current without harming scrolling or changing a photo while it is being selected. Enlarged photos use the shared accessible Dialog for focus trapping and Escape dismissal.
- Gallery navigation shares a bounded image-decode cache and commits only decoded frames, warming adjacent frames and retaining the last usable frame on download failure; this prevents empty transitions without downloading entire galleries.
- Technology gallery asset pointers use the hosted Lovable asset origin on GitHub Pages, because GitHub cannot serve the platform asset route.
- Technology gallery order/membership is stored as stable refs in `tech_galleries` (built-in photos as `s:<tech>:<index>`, uploads as public URLs) and applied over the static data at runtime, so saved order survives rebuilds and asset hash changes.

- UTT Europe (Gildan/Kariban/Regatta) syncs through the `utt-sync` Data Export API function into `utt_*` tables; buying prices live in service-role-only `utt_prices` and images are mirrored to the `utt-images` bucket because UTT forbids hotlinking and blocks hotlinking IPs.
