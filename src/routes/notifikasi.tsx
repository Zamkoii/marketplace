import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { RequireLogin, SiteShell } from "@/components/shop/SiteShell";
import { Empty } from "@/components/shop/ui-bits";
import { actions, useDB } from "@/lib/data/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/notifikasi")({
  head: () => ({ meta: [{ title: "Notifikasi — Pasarku" }, { name: "description", content: "Pusat notifikasi pesanan dan promo." }, { property: "og:title", content: "Notifikasi — Pasarku" }, { property: "og:description", content: "Notifikasi Anda." }] }),
  component: () => <SiteShell><RequireLogin><Notif /></RequireLogin></SiteShell>,
});

function Notif() {
  const list = useDB((d) => d.notifications.filter((n) => n.userId === d.currentUserId));
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between"><h1 className="font-display text-2xl font-bold">Notifikasi</h1>{list.length > 0 && <Button size="sm" variant="outline" onClick={() => actions.markNotificationsRead()}>Tandai dibaca</Button>}</div>
      {list.length === 0 ? <Empty icon={Bell} title="Belum ada notifikasi" /> : (
        <ul className="divide-y rounded-xl border bg-card">{list.map((n) => <li key={n.id} className={`p-4 text-sm ${n.read ? "" : "bg-primary-soft"}`}>{n.text}<p className="text-xs text-muted-foreground">{new Date(n.at).toLocaleString("id-ID")}</p></li>)}</ul>
      )}
    </div>
  );
}
