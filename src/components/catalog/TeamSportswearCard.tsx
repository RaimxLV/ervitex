import { ArrowUpRight, Users } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import photo from "@/assets/etx/team-sportswear.webp.asset.json";
import { sportswearGross, teamSportswearPrices } from "@/lib/teamSportswear";

export default function TeamSportswearCard({ lang }: { lang: "lv" | "en" }) {
  const lv = lang === "lv";
  const title = lv ? "Komandu sporta formas" : "Team sportswear";
  const photoUrl = photo.url.startsWith("/") ? `https://www.ervitex.lv${photo.url}` : photo.url;
  const format = (price: number) => new Intl.NumberFormat(lv ? "lv-LV" : "en-IE", { style: "currency", currency: "EUR" }).format(price);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="group relative h-full min-h-0 w-full overflow-hidden rounded-none border border-border bg-primary p-0 text-primary-foreground hover:bg-primary hover:text-primary-foreground focus-visible:ring-accent" aria-label={lv ? "Komandu sporta formas — cenrādis" : "Team sportswear — price list"}>
          <span className="relative block aspect-[3/4] w-full self-start">
            <img src={photoUrl} alt={title} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-105" />
          </span>
          <span className="absolute inset-0 flex items-center justify-center px-3">
            <span className="w-full border-y border-primary-foreground/25 bg-primary/85 px-2 py-5 text-center backdrop-blur-xs motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:-translate-y-1 sm:px-4 sm:py-7">
              <span className="block whitespace-normal font-heading text-lg font-black uppercase leading-tight sm:text-2xl">{title}</span>
              <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-primary-foreground/80">{lv ? "Cenrādis" : "Price list"}<ArrowUpRight className="h-4 w-4 text-accent motion-safe:transition-transform motion-safe:group-hover:translate-x-1 motion-safe:group-hover:-translate-y-1" /></span>
            </span>
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl gap-0 overflow-y-auto rounded-sm p-0">
        <DialogHeader className="border-b border-border px-5 pb-5 pt-7 text-left sm:px-8">
          <span className="mb-2 text-xs font-bold uppercase text-accent">{lv ? "Cenrādis" : "Price list"}</span>
          <DialogTitle className="pr-6 font-heading text-2xl font-black leading-tight tracking-normal">{title}</DialogTitle>
          <DialogDescription className="pt-2">{lv ? "Basketbols · Futbols · Florbols · Volejbols" : "Basketball · Football · Floorball · Volleyball"}</DialogDescription>
        </DialogHeader>
        <div className="px-4 py-3 sm:px-8 sm:py-5">
          <table className="w-full table-fixed text-sm">
            <colgroup><col /><col className="w-[78px] sm:w-[108px]" /><col className="w-[78px] sm:w-[108px]" /></colgroup>
            <thead><tr className="border-b-2 border-foreground">
              <th scope="col" className="py-3 pr-3 text-left text-xs font-semibold text-muted-foreground">{lv ? "Izstrādājums" : "Garment"}</th>
              <th scope="col" className="py-3 text-right text-[10px] font-semibold text-muted-foreground sm:text-xs">{lv ? "Bez PVN" : "Excl. VAT"}</th>
              <th scope="col" className="py-3 text-right text-[10px] font-bold sm:text-xs">{lv ? "Ar PVN" : "Incl. VAT"}</th>
            </tr></thead>
            <tbody>{teamSportswearPrices.map(row => <tr key={row.id} className={`border-b border-border last:border-b-0 ${row.id === "beach" ? "bg-muted/60" : "even:bg-muted/30"}`}>
              <th scope="row" className="break-words py-3 pr-3 text-left text-xs font-medium leading-relaxed sm:text-sm">{lv ? row.lv : row.en}</th>
              <td className="whitespace-nowrap py-3 text-right text-xs tabular-nums text-muted-foreground sm:text-sm">{format(row.net)}</td>
              <td className="whitespace-nowrap py-3 text-right text-xs font-bold tabular-nums sm:text-sm">{format(sportswearGross(row.net))}</td>
            </tr>)}</tbody>
          </table>
          <p className="mt-3 text-right text-[11px] text-muted-foreground">{lv ? "PVN 21%" : "VAT 21%"}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-muted/50 px-5 py-5 sm:px-8">
          <p className="flex items-center gap-2 text-sm font-medium"><Users className="h-5 w-5 shrink-0 text-accent" />{lv ? "Sīkāka informācija pie projektu vadītāja." : "Contact a project manager for more information."}</p>
          <Button asChild variant="outline" size="sm"><Link to="/contact">{lv ? "Kontakti" : "Contacts"}<ArrowUpRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}