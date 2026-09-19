import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { mediaAssets } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const [asset] = await getDb().select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
  if (!asset) return new Response("Not found", { status: 404 });
  const object = await env.BUCKET.get(asset.objectKey);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
