import { Suspense } from "react";
import { AssetView } from "@/components/detail/AssetView";

async function AssetContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AssetView slug={slug} modal />;
}

export default function InterceptedAsset({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={null}>
      <AssetContent params={params} />
    </Suspense>
  );
}