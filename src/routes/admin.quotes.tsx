import { createFileRoute } from "@tanstack/react-router";
import { privateHead } from "@/lib/seo";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminQuotes from "@/pages/admin/AdminQuotes";

export const Route = createFileRoute("/admin/quotes")({
  head: () => privateHead(),
  component: () => (
    <ProtectedRoute>
      <AdminQuotes />
    </ProtectedRoute>
  ),
});
