import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductRow {
  id: string;
  name_lv: string;
  name_en: string;
  category_id: string | null;
  material: string | null;
  featured: boolean | null;
  is_new: boolean | null;
  active: boolean | null;
  retail_price: number | null;
  wholesale_price: number | null;
  product_images: { url: string }[];
  categories: { name_en: string; name_lv: string } | null;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(url), categories(name_en, name_lv)")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProducts((data as unknown as ProductRow[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product deleted" });
      fetchProducts();
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} products in catalog</p>
        </div>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest">
          <Link to="/admin/products/new"><Plus className="mr-2 h-4 w-4" /> Add Product</Link>
        </Button>
      </div>

      <div className="mt-6 rounded-sm border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-3 text-left font-heading text-xs uppercase tracking-wider text-muted-foreground">Product</th>
              <th className="p-3 text-left font-heading text-xs uppercase tracking-wider text-muted-foreground">Category</th>
              <th className="p-3 text-left font-heading text-xs uppercase tracking-wider text-muted-foreground">Price</th>
              <th className="p-3 text-left font-heading text-xs uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="p-3 text-right font-heading text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No products yet</td></tr>
            ) : products.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {p.product_images?.[0] && (
                      <img src={p.product_images[0].url} alt="" className="h-10 w-10 rounded-sm object-cover" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">{p.name_en}</p>
                      <p className="text-xs text-muted-foreground">{p.name_lv}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{p.categories?.name_en || "—"}</td>
                <td className="p-3">
                  {p.retail_price ? `€${p.retail_price}` : "—"}
                  {p.wholesale_price && <span className="ml-1 text-xs text-muted-foreground">(W: €{p.wholesale_price})</span>}
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {p.featured && <Badge variant="secondary" className="text-[10px]">Featured</Badge>}
                    {p.is_new && <Badge className="bg-accent text-accent-foreground text-[10px]">New</Badge>}
                    {!p.active && <Badge variant="outline" className="text-[10px]">Inactive</Badge>}
                  </div>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/admin/products/${p.id}`}><Pencil className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
