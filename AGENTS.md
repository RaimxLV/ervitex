# Architecture rules

- Quote worksheet edits use side-specific autosaved drafts; only explicit confirmation updates the shared list and creates an immutable version, preventing incomplete client/staff edits from overwriting each other.
- Quote workflow history is append-only in `quote_events`; assignment and status changes must remain visible even when the current quote row changes.
- Client communication stays in normal email; the worksheet only edits and confirms products, then copies a reusable HTML/plain-text burgundy list link for email replies, maximizing compatibility across mail clients and dark mode.
- NWG syncs are resumable; pricing is list price after discount (Clique 63%, Craft 50%, ProJob/C&B 40%) ×1.75, with purchase price fallback only when list price is missing.
- Catalog cards use the displayed colour's variant-price range and carry that colour into the product view, so the price never changes merely by opening a product.
- "Ir noliktavā" is a manual admin flag in `stock_flags` per colour (`item_id` = `${id}::${color_code}`; bare `${id}` rows are legacy model-wide flags), separate from supplier data so syncs never erase it; it shows only in the product view for the selected colour, never on catalog cards; worksheet discount lives in `quote_requests.worksheet_discount` via admin-only RPC so it never enters client drafts.
- Shared worksheet printing costs use `PrintLine.scope = "order"` inside the existing side-specific item drafts, preserving autosave/version behavior without a second persistence path.
- Stock mutation controls render only after the authenticated admin role resolves, and every mutation revalidates the live user and role before writing; public users only see the outlined availability label.
- The homepage uses short-duration Lenis wheel smoothing on fine-pointer devices and native touch scrolling; its WebGL hero depth reacts to scroll and, on fine-pointer devices, to eased mouse movement, renders only while values change and pauses off-screen, balancing visible depth with smooth performance.
- Supplier purchase/wholesale price columns are excluded from anon/authenticated column GRANTs and internal SECURITY DEFINER helpers are service_role-only, so public catalog reads can never leak our buying prices or trigger syncs.
- Per-route title/description/canonical/robots are set client-side by `RouteSeo`; private token and admin routes are always noindex.
