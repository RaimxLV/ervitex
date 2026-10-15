import { createFileRoute } from "@tanstack/react-router";
import { privateHead } from "@/lib/seo";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminOfferEdit from "@/pages/admin/AdminOfferEdit";

export const Route = createFileRoute("/offers/$id")({
  head: () => privateHead(),
  component: () => (
    <ProtectedRoute>
      <AdminOfferEdit />
    </ProtectedRoute>
  ),
});
