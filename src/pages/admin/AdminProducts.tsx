import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductRow {
  id: string;
  name_lv: string;
  name_en: string;
  category_id: string | null;
  material: string | null;
  brand: string | null;
  featured: boolean | null;
  is_new: boolean | null;
  active: boolean | null;
  retail_price: number | null;
  wholesale_price: number | null;
  product_images: { url: string }[];
  categories: { name_en: string; name_lv: string } | null;
}

interface CategoryOption { id: string; name_en: string; }

const PER_PAGE = 50;

const AdminProducts = () => {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(url), categories(name_en, name_lv)")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProducts((data as unknown as ProductRow[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    supabase.from("categories").select("id, name_en").order("sort_order").then(({ data }) => {
      setCategories(data || []);
    });
    fetchProducts();
  }, []);

  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => { if (p.brand) set.add(p.brand); });
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name_en.toLowerCase().includes(q) ||
        p.name_lv.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      );
    }
    if (filterCategory !== "all") {
      list = list.filter(p => p.category_id === filterCategory);
    }
    if (filterBrand !== "all") {
      list = list.filter(p => p.brand === filterBrand);
    }
    if (filterStatus === "active") list = list.filter(p => p.active !== false);
    else if (filterStatus === "inactive") list = list.filter(p => p.active === false);
    else if (filterStatus === "featured") list = list.filter(p => p.featured);
    else if (filterStatus === "new") list = list.filter(p => p.is_new);
    return list;
  }, [products, search, filterCategory, filterBrand, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => { setPage(1); }, [search, filterCategory, filterBrand, filterStatus]);

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

  const handleToggleActive = async (id: string, currentActive: boolean | null) => {
    const { error } = await supabase.from("products").update({ active: !(currentActive ?? true) }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      fetchProducts();
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilterCategory("all");
    setFilterBrand("all");
    setFilterStatus("all");
  };

  const hasFilters = search || filterCategory !== "all" || filterBrand !== "all" || filterStatus !== "all";

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} of {products.length} products
          </p>
        </div>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest">
          <Link to="/admin/products/new"><Plus className="mr-2 h-4 w-4" /> Add Product</Link>
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, SKU, or brand..."
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterBrand} onValueChange={setFilterBrand}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Brand" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="new">New</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="mr-1 h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="mt-4 rounded-sm border border-border overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-3 text-left font-heading text-xs uppercase tracking-wider text-muted-foreground">Product</th>
              <th className="p-3 text-left font-heading text-xs uppercase tracking-wider text-muted-foreground">Brand</th>
              <th className="p-3 text-left font-heading text-xs uppercase tracking-wider text-muted-foreground">Category</th>
              <th className="p-3 text-left font-heading text-xs uppercase tracking-wider text-muted-foreground">Price</th>
              <th className="p-3 text-left font-heading text-xs uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="p-3 text-right font-heading text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">
                {hasFilters ? "No products match your filters" : "No products yet"}
              </td></tr>
            ) : paginated.map((p) => (
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
                <td className="p-3 text-muted-foreground text-xs">{p.brand || "—"}</td>
                <td className="p-3 text-muted-foreground">{p.categories?.name_en || "—"}</td>
                <td className="p-3">
                  {p.retail_price && p.retail_price > 0
                    ? `€${p.retail_price}`
                    : <span className="text-xs text-muted-foreground italic">Pēc pieprasījuma</span>}
                  {p.wholesale_price && p.wholesale_price > 0 && (
                    <span className="ml-1 text-xs text-muted-foreground">(W: €{p.wholesale_price})</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => handleToggleActive(p.id, p.active)}
                      className={`rounded-sm px-2 py-0.5 text-[10px] font-medium transition-colors ${
                        p.active !== false
                          ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {p.active !== false ? "Active" : "Inactive"}
                    </button>
                    {p.featured && <Badge variant="secondary" className="text-[10px]">Featured</Badge>}
                    {p.is_new && <Badge className="bg-accent text-accent-foreground text-[10px]">New</Badge>}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              ←
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              →
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
