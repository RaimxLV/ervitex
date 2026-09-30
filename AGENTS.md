# Architecture rules

- Quote worksheet edits use side-specific autosaved drafts; only explicit confirmation updates the shared list and creates an immutable version, preventing incomplete client/staff edits from overwriting each other.
- Quote workflow history is append-only in `quote_events`; assignment and status changes must remain visible even when the current quote row changes.
- Client communication stays in normal email; the worksheet only edits and confirms products, then copies a reusable HTML/plain-text burgundy list link for email replies, maximizing compatibility across mail clients and dark mode.
- Supplier syncs use bounded resumable work and database-dispatched continuation; NWG contract prices authenticate only with stored customer credentials, never the catalog token, and empty API responses never erase verified prices.
- Catalog cards use the displayed colour's variant-price range and carry that colour into the product view, so the price never changes merely by opening a product.
- "Ir noliktavā" is a manual admin flag in `stock_flags` per colour (`item_id` = `${id}::${color_code}`; bare `${id}` rows are legacy model-wide flags), separate from supplier data so syncs never erase it; it shows only in the product view for the selected colour, never on catalog cards; worksheet discount lives in `quote_requests.worksheet_discount` via admin-only RPC so it never enters client drafts.
- Shared worksheet printing costs use `PrintLine.scope = "order"` inside the existing side-specific item drafts, preserving autosave/version behavior without a second persistence path.
- Stock mutation controls render only after the authenticated admin role resolves, and every mutation revalidates the live user and role before writing; public users only see the outlined availability label.
