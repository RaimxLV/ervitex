import { createFileRoute } from "@tanstack/react-router";
import MalfiniPage from "@/pages/MalfiniPage";

export const Route = createFileRoute("/malfini")({
  component: MalfiniPage,
});
