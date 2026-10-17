import { createFileRoute } from "@tanstack/react-router";
import { RequireLogin, SiteShell } from "@/components/shop/SiteShell";
import { Empty } from "@/components/shop/ui-bits";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Pasarku" }, { name: "description", content: "Konsol admin marketplace." }, { property: "og:title", content: "Admin — Pasarku" }, { property: "og:description", content: "Konsol admin." }] }),
  component: () => <SiteShell><RequireLogin role="admin"><Empty title="Konsol admin belum dibuat">Akan diselesaikan pada tahap berikutnya.</Empty></RequireLogin></SiteShell>,
});
