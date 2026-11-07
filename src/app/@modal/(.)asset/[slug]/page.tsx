import { AssetView } from "@/components/detail/AssetView";

export default async function InterceptedAsset({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AssetView slug={slug} modal />;
}