import { createFileRoute } from "@tanstack/react-router";
import { legacyTarget } from "@/lib/legacyRedirects";

const handle = ({ params }: { params: { _splat?: string } }) =>
  new Response(null, { status: 301, headers: { Location: legacyTarget(params._splat ?? "") } });

export const Route = createFileRoute("/index.php/$")({
  server: { handlers: { GET: handle, HEAD: handle } },
});
