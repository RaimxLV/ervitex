import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import LoginPage from "@/pages/LoginPage";

export const Route = createFileRoute("/login")({
  head: () => pageHead("/login"),
  component: LoginPage,
});
