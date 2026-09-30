import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/** Kopīga, vienreiz ielādēta "Ir noliktavā" atzīmju kopa: atslēga `${source}:${id}`. */
let cache: Set<string> | null = null;
let loading: Promise<void> | null = null;
const listeners = new Set<(s: Set<string>) => void>();

const emit = () => listeners.forEach((l) => l(cache!));

const load = () => {
  if (!loading) {
    loading = (async () => {
      const next = new Set<string>();
      let from = 0;
      while (true) {
        const { data, error } = await supabase.from("stock_flags" as any).select("source,item_id").range(from, from + 999);
        if (error || !data) break;
        for (const r of data as any[]) next.add(`${r.source}:${r.item_id}`);
        if (data.length < 1000) break;
        from += 1000;
      }
      cache = next;
      emit();
    })();
  }
  return loading;
};

export const stockKey = (source: string, id: string) => `${source}:${id}`;

export const toggleStockFlag = async (source: string, id: string) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    toast.error("Noliktavas atzīmes var mainīt tikai administrators");
    return;
  }
  const { data: role, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (roleError || !role) {
    toast.error("Noliktavas atzīmes var mainīt tikai administrators");
    return;
  }
  const key = stockKey(source, id);
  const on = !cache?.has(key);
  const next = new Set(cache || []);
  if (on) next.add(key); else next.delete(key);
  cache = next;
  emit();
  const { error } = on
    ? await supabase.from("stock_flags" as any).upsert({ source, item_id: id } as any)
    : await supabase.from("stock_flags" as any).delete().eq("source", source).eq("item_id", id);
  if (error) {
    const back = new Set(cache);
    if (on) back.delete(key); else back.add(key);
    cache = back;
    emit();
    toast.error("Neizdevās saglabāt atzīmi");
    return;
  }
  toast.success(on ? "Atzīmēts: ir noliktavā" : "Noliktavas atzīme noņemta");
};

export const useStockFlags = () => {
  const [flags, setFlags] = useState<Set<string>>(cache || new Set());
  useEffect(() => {
    listeners.add(setFlags);
    if (cache) setFlags(cache); else load();
    return () => { listeners.delete(setFlags); };
  }, []);
  return flags;
};
