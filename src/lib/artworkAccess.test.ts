import { expect, it, vi } from "vitest";
import { verifiedArtworkPaths } from "../../supabase/functions/_shared/artwork-access";
const id="11111111-1111-4111-8111-111111111111"; const path=`${id}/33333333-3333-4333-8333-333333333333-artwork.pdf`;
function client(rows:unknown[],error:unknown=null) {return {from:()=>({select:()=>({eq:()=>({in:async()=>({data:rows,error})})})})};}
it("notifier rejects attacker URLs, another request and nonexistent storage refs",async()=>{
  for(const input of [["https://attacker.example.invalid/a.pdf"],[path.replace(id,"22222222-2222-4222-8222-222222222222")],[path]]) await expect(verifiedArtworkPaths(client([]),id,input)).rejects.toThrow();
});
it("only actual request-bound stored records may attach; pending never means clean",async()=>{
  expect(await verifiedArtworkPaths(client([{path,stored:true}]),id,[path])).toEqual([path]);
  await expect(verifiedArtworkPaths(client([{path,stored:false}]),id,[path])).rejects.toThrow();
});