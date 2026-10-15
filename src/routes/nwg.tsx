import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import NwgPage from "@/pages/NwgPage";

export const Route = createFileRoute("/nwg")({
  head: () => pageHead("/nwg"),
  component: NwgPage,
});
