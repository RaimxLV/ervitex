import { createFileRoute } from "@tanstack/react-router";
import { privateHead } from "@/lib/seo";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminOffers from "@/pages/admin/AdminOffers";

export const Route = createFileRoute("/offers/")({
  head: () => privateHead(),
  component: () => (
    <ProtectedRoute>
      <AdminOffers />
    </ProtectedRoute>
  ),
});
