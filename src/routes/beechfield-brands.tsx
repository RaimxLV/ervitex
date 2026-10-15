import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import BeechfieldBrandsPage from "@/pages/BeechfieldBrandsPage";

export const Route = createFileRoute("/beechfield-brands")({
  head: () => pageHead("/beechfield-brands"),
  component: BeechfieldBrandsPage,
});
