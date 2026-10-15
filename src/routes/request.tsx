import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import RequestPage from "@/pages/RequestPage";

export const Route = createFileRoute("/request")({
  head: () => pageHead("/request"),
  component: RequestPage,
});
