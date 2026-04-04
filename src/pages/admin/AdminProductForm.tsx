import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, X, Upload, GripVertical } from "lucide-react";

const PRINTING_TECHS = ["DTF", "Sietspiede", "Izšūšana", "Sublimācija"];
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];

interface CategoryOption { id: string; name_en: string; slug: string; }
interface ColorEntry { name: string; hex_code: string; image_url: string; }

const AdminProductForm = () => {
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  const navigate = useNavigate();
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [form, setForm] = useState({
    name_lv: "", name_en: "", description_lv: "", description_en: "",
    long_description_lv: "", long_description_en: "", material: "", brand: "",
    category_id: "", min_order: 1, retail_price: "", wholesale_price: "",
    bulk_discount_percent: 0, bulk_min_qty: 100,
    printing_techs: [] as string[], featured: false, is_new: false, active: true,
  });
  const [colors, setColors] = useState<ColorEntry[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingColorImg, setUploadingColorImg] = useState<number | null>(null);

  useEffect(() => {
    supabase.from("categories").select("id, name_en, slug").order("sort_order").then(({ data }) => {
      setCategories(data || []);
    });
    if (isEdit) loadProduct();
  }, [id]);

  const loadProduct = async () => {
    const { data: product } = await supabase.from("products").select("*").eq("id", id!).single();
    if (!product) return navigate("/admin/products");
    setForm({
      name_lv: product.name_lv, name_en: product.name_en,
      description_lv: product.description_lv || "", description_en: product.description_en || "",
      long_description_lv: product.long_description_lv || "", long_description_en: product.long_description_en || "",
      material: product.material || "", brand: product.brand || "",
      category_id: product.category_id || "",
      min_order: product.min_order || 1,
      retail_price: product.retail_price?.toString() || "",
      wholesale_price: product.wholesale_price?.toString() || "",
      bulk_discount_percent: product.bulk_discount_percent || 0,
      bulk_min_qty: product.bulk_min_qty || 100,
      printing_techs: product.printing_techs || [],
      featured: product.featured || false, is_new: product.is_new || false, active: product.active ?? true,
    });
    const { data: imgs } = await supabase.from("product_images").select("url").eq("product_id", id!).order("sort_order");
    setImageUrls(imgs?.map(i => i.url) || []);
    const { data: clrs } = await supabase.from("product_colors").select("name, hex_code, image_url").eq("product_id", id!);
    setColors(clrs?.map(c => ({ name: c.name, hex_code: c.hex_code || "#000000", image_url: c.image_url || "" })) || []);
    const { data: szs } = await supabase.from("product_sizes").select("size").eq("product_id", id!).order("sort_order");
    setSizes(szs?.map(s => s.size) || []);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      if (url) setImageUrls(prev => [...prev, url]);
    }
    setUploading(false);
  };

  const handleColorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingColorImg(idx);
    const url = await uploadFile(file);
    if (url) {
      setColors(prev => {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], image_url: url };
        return updated;
      });
    }
    setUploadingColorImg(null);
  };

  const toggleTech = (tech: string) => {
    setForm(prev => ({
      ...prev,
      printing_techs: prev.printing_techs.includes(tech)
        ? prev.printing_techs.filter(t => t !== tech)
        : [...prev.printing_techs, tech]
    }));
  };

  const toggleSize = (size: string) => {
    setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const handleSave = async () => {
    if (!form.name_lv.trim() || !form.name_en.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    setSaving(true);

    const retailPrice = form.retail_price ? parseFloat(form.retail_price) : null;
    const wholesalePrice = form.wholesale_price ? parseFloat(form.wholesale_price) : null;

    const productData = {
      name_lv: form.name_lv, name_en: form.name_en,
      description_lv: form.description_lv, description_en: form.description_en,
      long_description_lv: form.long_description_lv, long_description_en: form.long_description_en,
      material: form.material, brand: form.brand,
      category_id: form.category_id || null,
      min_order: form.min_order,
      retail_price: retailPrice && retailPrice > 0 ? retailPrice : null,
      wholesale_price: wholesalePrice && wholesalePrice > 0 ? wholesalePrice : null,
      bulk_discount_percent: form.bulk_discount_percent,
      bulk_min_qty: form.bulk_min_qty,
      printing_techs: form.printing_techs,
      featured: form.featured, is_new: form.is_new, active: form.active,
    };

    let productId = id;
    if (isEdit) {
      const { error } = await supabase.from("products").update(productData).eq("id", id!);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from("products").insert(productData).select("id").single();
      if (error || !data) { toast({ title: "Error", description: error?.message, variant: "destructive" }); setSaving(false); return; }
      productId = data.id;
    }

    // Sync images
    await supabase.from("product_images").delete().eq("product_id", productId!);
    if (imageUrls.length) {
      await supabase.from("product_images").insert(
        imageUrls.map((url, i) => ({ product_id: productId!, url, sort_order: i }))
      );
    }

    // Sync colors
    await supabase.from("product_colors").delete().eq("product_id", productId!);
    if (colors.length) {
      await supabase.from("product_colors").insert(
        colors.map(c => ({
          product_id: productId!,
          name: c.name,
          hex_code: c.hex_code,
          image_url: c.image_url || "",
        }))
      );
    }

    // Sync sizes
    await supabase.from("product_sizes").delete().eq("product_id", productId!);
    if (sizes.length) {
      await supabase.from("product_sizes").insert(
        sizes.map((size, i) => ({ product_id: productId!, size, sort_order: i }))
      );
    }

    setSaving(false);
    toast({ title: isEdit ? "Product updated" : "Product created" });
    navigate("/admin/products");
  };

  const removeImage = (idx: number) => {
    setImageUrls(prev => prev.filter((_, j) => j !== idx));
  };

  const moveImage = (idx: number, dir: -1 | 1) => {
    setImageUrls(prev => {
      const arr = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  };

  return (
    <AdminLayout>
      <Button variant="ghost" className="mb-4 text-muted-foreground" onClick={() => navigate("/admin/products")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
      </Button>

      <h1 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground">
        {isEdit ? "Edit Product" : "New Product"}
      </h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          <div className="rounded-sm border border-border p-5 space-y-4">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider">Basic Info</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label className="text-xs uppercase tracking-wider">Name (LV)</Label><Input value={form.name_lv} onChange={e => setForm({...form, name_lv: e.target.value})} /></div>
              <div><Label className="text-xs uppercase tracking-wider">Name (EN)</Label><Input value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label className="text-xs uppercase tracking-wider">Brand</Label><Input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="e.g. MALFINI, Clique" /></div>
              <div><Label className="text-xs uppercase tracking-wider">Material</Label><Input value={form.material} onChange={e => setForm({...form, material: e.target.value})} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label className="text-xs uppercase tracking-wider">Description (LV)</Label><Textarea value={form.description_lv} onChange={e => setForm({...form, description_lv: e.target.value})} rows={3} /></div>
              <div><Label className="text-xs uppercase tracking-wider">Description (EN)</Label><Textarea value={form.description_en} onChange={e => setForm({...form, description_en: e.target.value})} rows={3} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label className="text-xs uppercase tracking-wider">Long Description (LV)</Label><Textarea value={form.long_description_lv} onChange={e => setForm({...form, long_description_lv: e.target.value})} rows={4} /></div>
              <div><Label className="text-xs uppercase tracking-wider">Long Description (EN)</Label><Textarea value={form.long_description_en} onChange={e => setForm({...form, long_description_en: e.target.value})} rows={4} /></div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider">Category</Label>
              <Select value={form.category_id} onValueChange={v => setForm({...form, category_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-sm border border-border p-5 space-y-4">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider">Pricing</h2>
            <p className="text-xs text-muted-foreground">Leave price empty or set to 0 → catalog shows "Cena pēc pieprasījuma"</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label className="text-xs uppercase tracking-wider">Retail Price (€)</Label><Input type="number" step="0.01" value={form.retail_price} onChange={e => setForm({...form, retail_price: e.target.value})} placeholder="0 = request quote" /></div>
              <div><Label className="text-xs uppercase tracking-wider">Wholesale Price (€)</Label><Input type="number" step="0.01" value={form.wholesale_price} onChange={e => setForm({...form, wholesale_price: e.target.value})} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><Label className="text-xs uppercase tracking-wider">Min Order</Label><Input type="number" value={form.min_order} onChange={e => setForm({...form, min_order: parseInt(e.target.value) || 1})} /></div>
              <div><Label className="text-xs uppercase tracking-wider">Bulk Discount %</Label><Input type="number" value={form.bulk_discount_percent} onChange={e => setForm({...form, bulk_discount_percent: parseFloat(e.target.value) || 0})} /></div>
              <div><Label className="text-xs uppercase tracking-wider">Bulk Min Qty</Label><Input type="number" value={form.bulk_min_qty} onChange={e => setForm({...form, bulk_min_qty: parseInt(e.target.value) || 100})} /></div>
            </div>
          </div>

          <div className="rounded-sm border border-border p-5 space-y-4">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider">Printing Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {PRINTING_TECHS.map(tech => (
                <Button key={tech} type="button" variant={form.printing_techs.includes(tech) ? "default" : "outline"} size="sm"
                  onClick={() => toggleTech(tech)}
                  className={form.printing_techs.includes(tech) ? "bg-accent text-accent-foreground" : ""}
                >{tech}</Button>
              ))}
            </div>
          </div>

          <div className="rounded-sm border border-border p-5 space-y-4">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider">Flags</h2>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.featured} onCheckedChange={v => setForm({...form, featured: v})} /> Featured</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_new} onCheckedChange={v => setForm({...form, is_new: v})} /> New</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.active} onCheckedChange={v => setForm({...form, active: v})} /> Active</label>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="rounded-sm border border-border p-5 space-y-4">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider">Images ({imageUrls.length})</h2>
            <div className="grid grid-cols-3 gap-3">
              {imageUrls.map((url, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-sm bg-muted">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-start justify-between bg-black/0 p-1 transition-all group-hover:bg-black/30">
                    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {i > 0 && (
                        <button onClick={() => moveImage(i, -1)} className="rounded bg-background/80 p-0.5 text-[10px] font-bold">↑</button>
                      )}
                      {i < imageUrls.length - 1 && (
                        <button onClick={() => moveImage(i, 1)} className="rounded bg-background/80 p-0.5 text-[10px] font-bold">↓</button>
                      )}
                    </div>
                    <button onClick={() => removeImage(i)}
                      className="rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-accent px-1.5 py-0.5 text-[9px] font-bold text-accent-foreground">MAIN</span>}
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer items-center justify-center rounded-sm border-2 border-dashed border-border hover:border-accent transition-colors">
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                {uploading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
              </label>
            </div>
          </div>

          <div className="rounded-sm border border-border p-5 space-y-4">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider">Sizes</h2>
            <div className="flex flex-wrap gap-2">
              {SIZE_OPTIONS.map(size => (
                <Button key={size} type="button" variant={sizes.includes(size) ? "default" : "outline"} size="sm"
                  onClick={() => toggleSize(size)}
                  className={sizes.includes(size) ? "bg-accent text-accent-foreground" : ""}
                >{size}</Button>
              ))}
            </div>
          </div>

          <div className="rounded-sm border border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-sm font-bold uppercase tracking-wider">Color Variants ({colors.length})</h2>
              <Button type="button" variant="outline" size="sm" onClick={() => setColors([...colors, { name: "", hex_code: "#000000", image_url: "" }])}>
                <Plus className="mr-1 h-3 w-3" /> Add Color
              </Button>
            </div>
            <div className="space-y-3">
              {colors.map((color, i) => (
                <div key={i} className="rounded-sm border border-border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="color" value={color.hex_code} onChange={e => {
                      const updated = [...colors]; updated[i] = { ...updated[i], hex_code: e.target.value }; setColors(updated);
                    }} className="h-8 w-8 cursor-pointer rounded-sm border-0 p-0" />
                    <Input value={color.name} placeholder="Color name (e.g. Navy Blue)" onChange={e => {
                      const updated = [...colors]; updated[i] = { ...updated[i], name: e.target.value }; setColors(updated);
                    }} className="flex-1" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => setColors(colors.filter((_, j) => j !== i))}>
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  {/* Color variant image */}
                  <div className="flex items-center gap-2">
                    {color.image_url ? (
                      <div className="relative h-12 w-12 rounded-sm overflow-hidden bg-muted">
                        <img src={color.image_url} alt="" className="h-full w-full object-cover" />
                        <button
                          onClick={() => { const updated = [...colors]; updated[i] = { ...updated[i], image_url: "" }; setColors(updated); }}
                          className="absolute -right-0.5 -top-0.5 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-sm border border-dashed border-border hover:border-accent text-muted-foreground transition-colors">
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleColorImageUpload(e, i)} />
                        {uploadingColorImg === i
                          ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                          : <Upload className="h-3.5 w-3.5" />}
                      </label>
                    )}
                    <span className="text-[10px] text-muted-foreground">Variant image (shown in catalog thumbnails)</span>
                  </div>
                </div>
              ))}
              {colors.length === 0 && (
                <p className="text-xs text-muted-foreground italic py-2">No color variants. Add colors to enable variant thumbnails in the catalog.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Button onClick={handleSave} disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest">
          {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </Button>
        <Button variant="outline" onClick={() => navigate("/admin/products")}>Cancel</Button>
      </div>
    </AdminLayout>
  );
};

export default AdminProductForm;
