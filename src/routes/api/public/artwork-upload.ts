import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/artwork-upload")({
  server: { handlers: { POST: async ({ request }) => {
    const { handleArtworkUpload } = await import("@/lib/artworkUpload.server");
    return handleArtworkUpload(request);
  } } },
});