import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import Index from "@/pages/Index";

export const Route = createFileRoute("/")({
  head: () => pageHead("/"),
  component: Index,
});
