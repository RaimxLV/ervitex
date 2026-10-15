import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import AboutPage from "@/pages/AboutPage";

export const Route = createFileRoute("/about")({
  head: () => pageHead("/about"),
  component: AboutPage,
});
