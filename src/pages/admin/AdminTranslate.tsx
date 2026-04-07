import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Languages, Play, Square, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const BATCH_SIZE = 10;
const TOTAL_PRODUCTS = 1516;

const AdminTranslate = () => {
  const [running, setRunning] = useState(false);
  const [offset, setOffset] = useState(0);
  const [translated, setTranslated] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const stopRef = useRef(false);

  const addLog = (msg: string) => setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const runTranslation = async () => {
    setRunning(true);
    setDone(false);
    stopRef.current = false;
    let currentOffset = 0;
    let totalTranslated = 0;

    addLog("Sākam tulkošanu...");

    while (!stopRef.current) {
      try {
        addLog(`Apstrādājam batch: offset ${currentOffset}, batch size ${BATCH_SIZE}`);

        const { data: { session } } = await supabase.auth.getSession();
        const resp = await supabase.functions.invoke("translate-products", {
          body: { offset: currentOffset, limit: BATCH_SIZE },
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
        });

        if (resp.error) {
          addLog(`❌ Kļūda: ${resp.error.message}`);
          break;
        }

        const result = resp.data;

        if (result.error) {
          addLog(`❌ Kļūda: ${result.error}`);
          break;
        }

        totalTranslated += result.translated || 0;
        setTranslated(totalTranslated);
        setOffset(currentOffset);
        addLog(`✅ Iztulkoti: ${result.translated || 0}, Kopā: ${totalTranslated}`);

        if (result.done) {
          addLog("🎉 Visi produkti apstrādāti!");
          setDone(true);
          break;
        }

        currentOffset = result.offset;

        // Small delay to avoid rate limiting
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err: any) {
        addLog(`❌ Kļūda: ${err.message}`);
        break;
      }
    }

    if (stopRef.current) addLog("⏹ Apturēts lietotāja pieprasījumā.");
    setRunning(false);
    toast.success(`Tulkošana pabeigta! Iztulkoti ${totalTranslated} produkti.`);
  };

  const stop = () => {
    stopRef.current = true;
  };

  const progress = Math.min((offset / TOTAL_PRODUCTS) * 100, 100);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Languages className="h-6 w-6 text-accent" />
          <h1 className="text-2xl font-bold">Produktu tulkošana (LV → EN)</h1>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <p className="text-muted-foreground">
            Šis rīks automātiski iztulkos visu {TOTAL_PRODUCTS} produktu nosaukumus un aprakstus no latviešu uz angļu valodu, izmantojot AI.
            Process notiek pa {BATCH_SIZE} produktiem vienlaicīgi.
          </p>

          <div className="flex gap-3">
            <Button onClick={runTranslation} disabled={running} className="gap-2">
              <Play className="h-4 w-4" />
              {done ? "Palaist vēlreiz" : "Sākt tulkošanu"}
            </Button>
            {running && (
              <Button variant="destructive" onClick={stop} className="gap-2">
                <Square className="h-4 w-4" /> Apturēt
              </Button>
            )}
          </div>

          {(running || translated > 0) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{translated} iztulkoti / ~{TOTAL_PRODUCTS}</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {done && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Tulkošana pabeigta!</span>
            </div>
          )}
        </div>

        {log.length > 0 && (
          <div className="rounded-lg border border-border bg-muted/30 p-4 max-h-80 overflow-y-auto">
            <h3 className="font-medium mb-2">Žurnāls</h3>
            <div className="space-y-1 text-xs font-mono">
              {log.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTranslate;
