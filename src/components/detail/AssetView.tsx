import { notFound } from "next/navigation";
import { docFor } from "@/lib/docs";
import { AssetDocs } from "./AssetDocs";
import { DetailShell } from "./DetailShell";
import { loadAssets } from "@/lib/stats";

/** Looks the asset up and lays the page out. Used by the direct page and by the one that opens over the grid. */
export async function AssetView({ slug, modal = false }: { slug: string; modal?: boolean }) {
const asset = (await loadAssets()).find((a) => a.slug === slug);
  if (!asset) notFound();
  const doc = docFor(slug);
  return (
    <DetailShell asset={asset} summary={doc?.summary} getCode={doc?.getCode} modal={modal}>
      <AssetDocs slug={slug} />
    </DetailShell>
  );
}