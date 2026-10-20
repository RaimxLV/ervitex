import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { NotifyResult } from "./requestSubmission";

export async function saveRequest(id: string, key: string, payload: Record<string, unknown>) {
  const { error } = await supabase.rpc("submit_quote_request", { _id: id, _key: key, _payload: payload as Json });
  if (error) throw error;
}
/** 403/404 mean the endpoint refuses this request/capability: do not retry or resubmit. */
export async function notifyRequest(id: string, key: string, paths: string[] = []): Promise<NotifyResult> {
  try {
    const { data, error } = await supabase.functions.invoke("send-quote-request", { body: { request_id: id, submission_key: key, file_urls: paths } });
    if (error) {
      const status = (error as { context?: { status?: number } }).context?.status;
      return status === 403 || status === 404 ? "rejected" : false;
    }
    return data?.delivered === true;
  } catch { return false; }
}
