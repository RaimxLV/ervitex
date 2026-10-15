import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import ContactPage from "@/pages/ContactPage";

export const Route = createFileRoute("/contact")({
  head: () => pageHead("/contact"),
  component: ContactPage,
});
