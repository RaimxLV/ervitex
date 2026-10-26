import { beforeEach, expect, it, vi } from "vitest";
import { boundedArtworkBody, handleArtworkUpload } from "./artworkUpload.server";
const mock=vi.hoisted(()=>({q: {submission_key:"22222222-2222-4222-8222-222222222222"} as {submission_key:string}|null, rpc:vi.fn(), upload:vi.fn(), update:vi.fn()}));
vi.mock("@/integrations/supabase/client.server",()=>({supabaseAdmin:{
  from: (name:string)=> name==="quote_requests" ? {select:()=>({eq:()=>({maybeSingle:async()=>({data:mock.q,error:null})})})} : {update:(v:unknown)=>{mock.update(v);return {eq:()=>({eq:async()=>({error:null})})};}},
  rpc:mock.rpc,storage:{from:()=>({upload:mock.upload})}
}}));
vi.mock("./artworkScanner.server",()=>({scanArtwork:async()=>"pending",scannerConfigured:()=>false}));
const id="11111111-1111-4111-8111-111111111111";
function request(overrides:Record<string,string>={},body=new TextEncoder().encode("%PDF-1.7\nfixture\n%%EOF\n")) {return new Request("http://localhost:8080/api/public/artwork-upload",{method:"POST",headers:{Origin:"http://localhost:8080","X-Request-Id":id,"X-Submission-Key":"22222222-2222-4222-8222-222222222222","X-File-Id":"33333333-3333-4333-8333-333333333333","X-File-Name":"logo.pdf","X-File-Type":"application/pdf",...overrides},body});}
beforeEach(()=>{vi.clearAllMocks(); mock.q={submission_key:"22222222-2222-4222-8222-222222222222"};mock.rpc.mockResolvedValue({data:"new",error:null});mock.upload.mockResolvedValue({error:null});});
it("wrong capability and cross-site requests never read/upload bytes to storage",async()=>{
  expect((await handleArtworkUpload(request({"X-Submission-Key":"44444444-4444-4444-8444-444444444444"}))).status).toBe(403);
  expect((await handleArtworkUpload(request({Origin:"https://attacker.example.invalid"}))).status).toBe(403);
  expect(mock.upload).not.toHaveBeenCalled();expect(mock.rpc).not.toHaveBeenCalled();
});
it("renamed EXE is rejected before reservation/storage",async()=>{expect((await handleArtworkUpload(request({},new TextEncoder().encode("MZ harmless fixture")))).status).toBe(400);expect(mock.rpc).not.toHaveBeenCalled();expect(mock.upload).not.toHaveBeenCalled();});
it("server reservation limit rejects before storage",async()=>{mock.rpc.mockResolvedValue({data:null,error:new Error("limit")});expect((await handleArtworkUpload(request())).status).toBe(409);expect(mock.upload).not.toHaveBeenCalled();});
it("valid PDF is automatically validated (policy, not antivirus) and stays private",async()=>{const response=await handleArtworkUpload(request(undefined,new TextEncoder().encode("%PDF-1.7\nfixture\n%%EOF\n")));expect(response.status).toBe(200); const data=await response.json();expect(data.status).toBe("validated");expect(data.path).toBe(`${id}/33333333-3333-4333-8333-333333333333-artwork.pdf`);expect(mock.update).toHaveBeenCalledWith(expect.objectContaining({status:"validated",stored:true,checked_sha256:expect.stringMatching(/^[a-f0-9]{64}$/)}));});
it("bounded stream rejects oversized body independent of content-length",async()=>{await expect(boundedArtworkBody(new Request("http://localhost",{method:"POST",body:new Uint8Array(15728641)}))).rejects.toThrow("15 MB");});