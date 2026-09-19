import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { siteConfigs } from "@/db/schema";
import { DEFAULT_SITE_CONFIG, normalizeSiteConfig, type SiteConfig } from "@/lib/site-config";

const CONFIG_ID = 1;

export async function readSiteConfig(): Promise<SiteConfig> {
  try {
    const db = getDb();
    const [row] = await db.select().from(siteConfigs).where(eq(siteConfigs.id, CONFIG_ID)).limit(1);
    if (!row) return structuredClone(DEFAULT_SITE_CONFIG);
    return normalizeSiteConfig(JSON.parse(row.payload));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("unavailable") || message.includes("no such table")) {
      return structuredClone(DEFAULT_SITE_CONFIG);
    }
    throw error;
  }
}

export async function writeSiteConfig(config: SiteConfig, userId: string): Promise<SiteConfig> {
  const normalized = normalizeSiteConfig(config);
  const db = getDb();
  await db
    .insert(siteConfigs)
    .values({
      id: CONFIG_ID,
      payload: JSON.stringify(normalized),
      updatedAt: Date.now(),
      updatedBy: userId,
    })
    .onConflictDoUpdate({
      target: siteConfigs.id,
      set: {
        payload: JSON.stringify(normalized),
        updatedAt: Date.now(),
        updatedBy: userId,
      },
    });
  return normalized;
}
