import { createFileRoute } from "@tanstack/react-router";
import StanleyStellaPage from "@/pages/StanleyStellaPage";

export const Route = createFileRoute("/stanley-stella")({
  component: StanleyStellaPage,
});
