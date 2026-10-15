import { createFileRoute } from "@tanstack/react-router";
import NwgPage from "@/pages/NwgPage";

export const Route = createFileRoute("/nwg")({
  component: NwgPage,
});
