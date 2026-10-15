# Architecture rules

- Search shares searchScore/exactCodeHits.
- productContent separates supplier care/specs; fingerprint translation caches to avoid stale metadata.
- Offers use CreateOfferButton and protected /offers with OfferWorkspace; sharing activates drafts automatically, without manual statuses.
- Share ColorSelector, SizeQuantityTable, QuoteItemsTable, PrintRows, QuoteSteps; offer pickers collapse on add/outside/Escape, reopen from headers. OrderMinimumNotice uses original category/name via orderMinimums, not translations; guidance never blocks requests.

- Public icons share AccentIcon framed/inline variants and semantic tones; print-icons holds Lucide-compatible print symbols for consistent strokes and sizes.
- Public eyebrows share red line-labels; other tones are icon-only; technology use cases use centered light panels.

- Office contours/hotspots share cover-scene coordinates; halos use separate feGaussianBlur polygons with oversized regions to prevent clipping.
- Team uses immutable photo_url/framing and current CDN fallbacks; admin-only writes. Manual uploads share WebP optimization to avoid heavy originals.

- Quote worksheet edits use side-specific autosaved drafts; only explicit confirmation updates the shared list and creates an immutable version, preventing incomplete client/staff edits from overwriting each other.
- `quote_events` is append-only; assignment/status history survives quote row changes.
- Communication stays in normal email; worksheets edit/confirm products and copy an HTML/plain-text burgundy list link for mail-client and dark-mode compatibility.
- NWG syncs are resumable; catalog refresh and price audit apply the same brand-specific discount and markup to list prices, with purchase price fallback only when list price is missing, preventing repricing drift.
- Catalog cards default to the cheapest positive-priced colour and product views select its cheapest size via shared catalogPriceSelection helpers; explicit colour/size choices take precedence, keeping card and detail prices aligned.
- "Ir noliktavā" is a manual admin flag in `stock_flags` per colour (`item_id` = `${id}::${color_code}`; bare `${id}` rows are legacy model-wide flags), separate from supplier data so syncs never erase it; it shows only in the product view for the selected colour, never on catalog cards; worksheet discount lives in `quote_requests.worksheet_discount` via admin-only RPC so it never enters client drafts.
- Shared worksheet/offer prints use scope="order" in existing item JSON; orderPrinting preserves offer-wide prints on deletion, preventing duplicate charges and extra storage.
- Stock mutation controls render only after the authenticated admin role resolves, and every mutation revalidates the live user and role before writing; public users only see the outlined availability label.
- Native browser scrolling only (no Lenis: busy-thread jumps). WebGL depth follows scroll/eased fine-pointer movement, renders on change and pauses off-screen.
- Supplier purchase/wholesale price columns are excluded from anon/authenticated column GRANTs and internal SECURITY DEFINER helpers are service_role-only, so public catalog reads can never leak our buying prices or trigger syncs.
- RouteSeo sets client-side title/description/canonical/robots; private token and admin routes stay noindex.
- Old phone/home-screen installs: sw.js and service-worker.js are self-unregistering kill-switches; never delete them, because a 404 leaves stale service workers serving broken cached pages.
- Homepage mosaic uses all `techs` galleries; loads near viewport, decodes before fading, pauses off-screen/hidden, during pointer/keyboard interaction/dialogs and reduced motion; enlargement uses shared accessible Dialog.
- Galleries share bounded decoding, warm adjacent frames and retain the last frame on failure to avoid blanks. Catalog hover replaces only loaded photos with exclusive visibility; Malfini prefers clean front photos over ghosted dimension diagrams.
- Hosted logo pointers and BrandLogo serve all cards; ETX cards use Ervitex; filters unchanged.
- tech_galleries stores stable order/membership refs (s:<tech>:<index> for built-ins, public URLs for uploads), applied over static data so rebuilds preserve order.

- UTT uses `utt-sync` Data Export into `utt_*`; service-role-only `utt_prices`; images mirrored in `utt-images` because UTT blocks hotlinking.
- `.hero-ultra` thickens the 700-capped heading face with -webkit-text-stroke; repeat leading per breakpoint to override theme text-size line-height.

- ManualProductOrder is shared by catalog/admin; catalog_filter_order persists order. Render after batch/cache checks; informational cards aren't purchasable.
- Manual products reuse products/images/sizes via catalog_items; refresh rebuilds retail prices. UUIDs are not manufacturer codes.

- QuoteCartButton owns mobile dock visibility/safe-area clearance; desktop CTA floats.
- Headwear shares name/description classification and a category-conditional URL facet; bump cache schema on field changes to avoid stale types.
