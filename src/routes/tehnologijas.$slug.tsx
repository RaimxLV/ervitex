import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import TechnologyPage from "@/pages/TechnologyPage";

export const Route = createFileRoute("/tehnologijas/$slug")({
  head: ({ params }) => pageHead(`/tehnologijas/${params.slug}`),
  component: TechnologyPage,
});
