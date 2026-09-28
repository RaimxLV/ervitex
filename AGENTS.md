# Architecture rules

- Quote worksheet edits use side-specific autosaved drafts; only explicit confirmation updates the shared list and creates an immutable version, preventing incomplete client/staff edits from overwriting each other.
- Quote workflow history is append-only in `quote_events`; assignment and status changes must remain visible even when the current quote row changes.
- Client communication stays in normal email; the worksheet only edits and confirms products, then copies a reusable HTML/plain-text burgundy list link for email replies, maximizing compatibility across mail clients and dark mode.