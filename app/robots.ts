import type { MetadataRoute } from "next";
import { readSiteConfig } from "@/lib/site-store";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const config = await readSiteConfig();
  return config.seo.noIndex
    ? { rules: { userAgent: "*", disallow: "/" } }
    : { rules: { userAgent: "*", allow: "/" } };
}
