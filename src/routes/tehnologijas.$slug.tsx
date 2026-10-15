import { createFileRoute } from "@tanstack/react-router";
import TechnologyPage from "@/pages/TechnologyPage";

export const Route = createFileRoute("/tehnologijas/$slug")({
  component: TechnologyPage,
});
