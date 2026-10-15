import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import MalfiniPage from "@/pages/MalfiniPage";

export const Route = createFileRoute("/malfini")({
  head: () => pageHead("/malfini"),
  component: MalfiniPage,
});
