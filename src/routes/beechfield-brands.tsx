import { createFileRoute } from "@tanstack/react-router";
import BeechfieldBrandsPage from "@/pages/BeechfieldBrandsPage";

export const Route = createFileRoute("/beechfield-brands")({
  component: BeechfieldBrandsPage,
});
