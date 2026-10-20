import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export async function saveRequest(id: string, key: string, payload: Record<string, unknown>) {
  const { error } = await supabase.rpc("submit_quote_request", { _id: id, _key: key, _payload: payload as Json });
  if (error) throw error;
}
export async function notifyRequest(id: string, key: string, paths: string[] = []) {
  try {
    const { data, error } = await supabase.functions.invoke("send-quote-request", { body: { request_id: id, submission_key: key, file_urls: paths } });
    return !error && data?.delivered === true;
  } catch { return false; }
}