import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
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

interface CategoryOption { id: string; name_lv: string; }

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
      toast({ title: "Kļūda", description: error.message, variant: "destructive" });
    } else {
      setProducts((data as unknown as ProductRow[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    supabase.from("categories").select("id, name_lv").order("sort_order").then(({ data }) => {
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
    if (filterCategory !== "all") list = list.filter(p => p.category_id === filterCategory);
    if (filterBrand !== "all") list = list.filter(p => p.brand === filterBrand);
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
    if (!confirm("Vai tiešām dzēst šo produktu?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Kļūda", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Produkts dzēsts" });
      fetchProducts();
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean | null) => {
    const { error } = await supabase.from("products").update({ active: !(currentActive ?? true) }).eq("id", id);
    if (error) {
      toast({ title: "Kļūda", description: error.message, variant: "destructive" });
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-black uppercase tracking-wide text-foreground">Produkti</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} no {products.length} produktiem
          </p>
        </div>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest">
          <Link to="/admin/products/new"><Plus className="mr-2 h-4 w-4" /> Pievienot jaunu</Link>
        </Button>
      </div>

      {/* Filtri */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Meklēt pēc nosaukuma vai zīmola..."
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Kategorija" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Visas kategorijas</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name_lv}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterBrand} onValueChange={setFilterBrand}>
            <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Zīmols" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Visi zīmoli</SelectItem>
              {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[130px]"><SelectValue placeholder="Statuss" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Visi statusi</SelectItem>
              <SelectItem value="active">Aktīvs</SelectItem>
              <SelectItem value="inactive">Neaktīvs</SelectItem>
              <SelectItem value="featured">Izcelts</SelectItem>
              <SelectItem value="new">Jauns</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="mr-1 h-3 w-3" /> Notīrīt
          </Button>
        )}
      </div>

      {/* Desktop tabula */}
      <div className="mt-4 hidden sm:block rounded-sm border border-border overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-3 text-left font-heading text-xs uppercase tracking-wider text-muted-foreground">Produkts</th>
              <th className="p-3 text-left font-heading text-xs uppercase tracking-wider text-muted-foreground">Zīmols</th>
              <th className="p-3 text-left font-heading text-xs uppercase tracking-wider text-muted-foreground">Kategorija</th>
              <th className="p-3 text-left font-heading text-xs uppercase tracking-wider text-muted-foreground">Cena</th>
              <th className="p-3 text-left font-heading text-xs uppercase tracking-wider text-muted-foreground">Statuss</th>
              <th className="p-3 text-right font-heading text-xs uppercase tracking-wider text-muted-foreground">Darbības</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Ielādē...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">
                {hasFilters ? "Nav atrasti produkti ar šiem filtriem" : "Nav produktu"}
              </td></tr>
            ) : paginated.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {p.product_images?.[0] && (
                      <img src={p.product_images[0].url} alt="" className="h-10 w-10 rounded-sm object-cover" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">{p.name_lv}</p>
                      <p className="text-xs text-muted-foreground">{p.name_en}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground text-xs">{p.brand || "—"}</td>
                <td className="p-3 text-muted-foreground">{p.categories?.name_lv || "—"}</td>
                <td className="p-3">
                  {p.retail_price && p.retail_price > 0
                    ? `€${p.retail_price}`
                    : <span className="text-xs text-muted-foreground italic">Pēc pieprasījuma</span>}
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
                      {p.active !== false ? "Aktīvs" : "Neaktīvs"}
                    </button>
                    {p.featured && <Badge variant="secondary" className="text-[10px]">Izcelts</Badge>}
                    {p.is_new && <Badge className="bg-accent text-accent-foreground text-[10px]">Jauns</Badge>}
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

      {/* Mobilās kartītes */}
      <div className="mt-4 space-y-3 sm:hidden">
        {loading ? (
          <p className="py-8 text-center text-muted-foreground">Ielādē...</p>
        ) : paginated.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            {hasFilters ? "Nav atrasti produkti" : "Nav produktu"}
          </p>
        ) : paginated.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                {p.product_images?.[0] && (
                  <img src={p.product_images[0].url} alt="" className="h-14 w-14 rounded-sm object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{p.name_lv}</p>
                  <p className="text-xs text-muted-foreground">{p.brand || "—"} · {p.categories?.name_lv || "—"}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {p.retail_price && p.retail_price > 0 ? `€${p.retail_price}` : <span className="text-xs italic text-muted-foreground">Pēc pieprasījuma</span>}
                    </span>
                    <button
                      onClick={() => handleToggleActive(p.id, p.active)}
                      className={`rounded-sm px-1.5 py-0.5 text-[10px] font-medium ${
                        p.active !== false ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.active !== false ? "Aktīvs" : "Neaktīvs"}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link to={`/admin/products/${p.id}`}><Pencil className="h-3.5 w-3.5" /></Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lapošana */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {page}. lapa no {totalPages}
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
