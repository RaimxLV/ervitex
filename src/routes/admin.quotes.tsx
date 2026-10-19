import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminQuotes from "@/pages/admin/AdminQuotes";

export const Route = createFileRoute("/admin/quotes")({
  head: () => pageHead("/admin/quotes", { title: "Pieprasījumi | Ervitex", desc: "Ervitex klientu pieprasījumi un preču saraksti.", noindex: true }),
  component: () => (
    <ProtectedRoute>
      <AdminQuotes />
    </ProtectedRoute>
  ),
});
