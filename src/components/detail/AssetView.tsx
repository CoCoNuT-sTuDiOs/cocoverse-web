import { notFound } from "next/navigation";
import { ASSETS } from "@/lib/assets";
import { docFor } from "@/lib/docs";
import { AssetDocs } from "./AssetDocs";
import { DetailShell } from "./DetailShell";

/** Looks the asset up and lays the page out. Used by the direct page and by the one that opens over the grid. */
export function AssetView({ slug, modal = false }: { slug: string; modal?: boolean }) {
  const asset = ASSETS.find((a) => a.slug === slug);
  if (!asset) notFound();
  const doc = docFor(slug);
  return (
    <DetailShell asset={asset} summary={doc?.summary} getCode={doc?.getCode} modal={modal}>
      <AssetDocs slug={slug} />
    </DetailShell>
  );
}