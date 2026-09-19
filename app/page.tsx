import type { Metadata } from "next";
import { PublicSite } from "@/components/public-site";
import { readSiteConfig } from "@/lib/site-store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const config = await readSiteConfig();
  return {
    title: config.seo.title,
    description: config.seo.description,
    robots: config.seo.noIndex
      ? { index: false, follow: false, noarchive: true, googleBot: { index: false, follow: false, noimageindex: true } }
      : { index: true, follow: true },
    icons: { icon: config.brand.logo.src },
  };
}

export default async function HomePage() {
  const config = await readSiteConfig();
  return (
    <>
      <link rel="stylesheet" href="/site.css" />
      <PublicSite config={config} />
    </>
  );
}
