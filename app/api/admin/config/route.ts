import { getChatGPTUser } from "@/app/chatgpt-auth";
import { normalizeSiteConfig } from "@/lib/site-config";
import { readSiteConfig, writeSiteConfig } from "@/lib/site-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Требуется вход" }, { status: 401 });
  return Response.json({ config: await readSiteConfig() });
}

export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Требуется вход" }, { status: 401 });
  try {
    const payload = await request.json();
    const config = normalizeSiteConfig(payload?.config);
    const saved = await writeSiteConfig(config, user.userId);
    return Response.json({ config: saved, savedAt: new Date().toISOString() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не удалось сохранить изменения" }, { status: 500 });
  }
}
