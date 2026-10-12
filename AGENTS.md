# Architecture rules

- Search shares searchScore/exactCodeHits for consistent ranking.
- productContent separates supplier care/specs; fingerprint translation caches to avoid stale metadata.
- Offers share CreateOfferButton and pm_offers drafts; staff use protected /offers with OfferWorkspace, never the admin shell.
- Share ColorSelector, SizeQuantityTable, QuoteItemsTable, PrintRows and QuoteSteps to prevent UI drift.

- Public icons share AccentIcon framed/inline variants and semantic tones; print-icons holds Lucide-compatible print symbols for consistent strokes and sizes.
- Public section eyebrows use one red line-label style; blue/cyan/green/slate remain icon-only, and technology use cases sit in a light centered panel for visual continuity.

- Office-photo contours and hotspots share photo coordinates in one cover-sized scene for alignment; halos use separate SVG feGaussianBlur polygons with oversized regions to avoid shape clipping.
- Team photo overrides use immutable product-images files and team_photo_settings.photo_url alongside framing; static portraits remain fallbacks, with admin-only writes.

- Quote worksheet edits use side-specific autosaved drafts; only explicit confirmation updates the shared list and creates an immutable version, preventing incomplete client/staff edits from overwriting each other.
- Quote workflow history is append-only in `quote_events`; assignment and status changes must remain visible even when the current quote row changes.
- Communication stays in normal email; worksheets edit/confirm products and copy an HTML/plain-text burgundy list link for mail-client and dark-mode compatibility.
- NWG syncs are resumable; catalog refresh and price audit apply the same brand-specific discount and markup to list prices, with purchase price fallback only when list price is missing, preventing repricing drift.
- Catalog cards default to the cheapest positive-priced colour and product views select its cheapest size via shared catalogPriceSelection helpers; explicit colour/size choices take precedence, keeping card and detail prices aligned.
- "Ir noliktavā" is a manual admin flag in `stock_flags` per colour (`item_id` = `${id}::${color_code}`; bare `${id}` rows are legacy model-wide flags), separate from supplier data so syncs never erase it; it shows only in the product view for the selected colour, never on catalog cards; worksheet discount lives in `quote_requests.worksheet_discount` via admin-only RPC so it never enters client drafts.
- Shared worksheet/offer prints use scope="order" in existing item JSON; orderPrinting preserves offer-wide prints on deletion, preventing duplicate charges and extra storage.
- Stock mutation controls render only after the authenticated admin role resolves, and every mutation revalidates the live user and role before writing; public users only see the outlined availability label.
- All pages use native browser scrolling (no Lenis), because JS wheel smoothing jumps when the main thread is busy. WebGL hero depth follows scroll/eased fine-pointer movement, renders on change and pauses off-screen for performance.
- Supplier purchase/wholesale price columns are excluded from anon/authenticated column GRANTs and internal SECURITY DEFINER helpers are service_role-only, so public catalog reads can never leak our buying prices or trigger syncs.
- RouteSeo sets client-side title/description/canonical/robots; private token and admin routes stay noindex.
- Old phone/home-screen installs: sw.js and service-worker.js are self-unregistering kill-switches; never delete them, because a 404 leaves stale service workers serving broken cached pages.
- Homepage mosaic uses all `techs` galleries; loads near viewport, decodes before fading, pauses off-screen/hidden, during pointer/keyboard interaction/dialogs and reduced motion; enlargement uses shared accessible Dialog.
- Galleries share bounded decoding, warm adjacent frames and retain the last frame on failure to avoid blanks. Catalog hover replaces only loaded photos with exclusive visibility; Malfini prefers clean front photos over ghosted dimension diagrams.
- Technology gallery asset pointers use the hosted Lovable asset origin on GitHub Pages, because GitHub cannot serve the platform asset route.
- Technology gallery order/membership is stored as stable refs in `tech_galleries` (built-in photos as `s:<tech>:<index>`, uploads as public URLs) and applied over the static data at runtime, so saved order survives rebuilds and asset hash changes.

- UTT Europe (Gildan/Kariban/Regatta) syncs through the `utt-sync` Data Export API function into `utt_*` tables; buying prices live in service-role-only `utt_prices` and images are mirrored to the `utt-images` bucket because UTT forbids hotlinking and blocks hotlinking IPs.
- Headings are thickened with `.hero-ultra` (-webkit-text-stroke) because the heading face caps at 700; its leading must be repeated per breakpoint, since theme text sizes emit their own line-height.

- Catalog filter order (sections and items) lives in `catalog_filter_order` (admin-only writes, public read) and is applied with applyOrder so new filters append after saved ones; the IndexedDB catalog cache is only served when its row count matches the live count and the grid renders only after all batches, so stale supplier lists never flash.
