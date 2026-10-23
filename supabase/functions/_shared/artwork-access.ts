import { scopedAttachmentPaths } from "./request-safety.ts";

/** Never embed storage bearer URLs or customer-supplied remote URLs in staff email. */
export async function verifiedArtworkPaths(client: any, requestId: string, input: unknown): Promise<string[]> {
  const paths = scopedAttachmentPaths(requestId, input);
  if (paths.length > 10) throw new Error("Too many attachments");
  if (!paths.length) return [];
  const { data, error } = await client.from("quote_artwork").select("path,stored").eq("quote_id", requestId).in("path", paths);
  if (error || paths.some((path) => !data?.some((r: { path: string; stored: boolean }) => r.path === path && r.stored))) throw new Error("Unverified attachment");
  return paths;
}