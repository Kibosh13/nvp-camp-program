import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { mediaAssets } from "@/db/schema";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 15 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Требуется вход" }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Выберите файл" }, { status: 400 });
    if (!file.type.startsWith("image/")) return Response.json({ error: "Можно загружать только изображения" }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return Response.json({ error: "Размер файла не должен превышать 15 МБ" }, { status: 400 });

    const id = crypto.randomUUID();
    const extension = file.name.includes(".") ? file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") : "img";
    const objectKey = `site-media/${id}.${extension || "img"}`;
    await env.BUCKET.put(objectKey, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
      customMetadata: { uploadedBy: user.userId, originalName: file.name },
    });
    await getDb().insert(mediaAssets).values({
      id,
      objectKey,
      originalName: file.name,
      contentType: file.type,
      size: file.size,
      uploadedAt: Date.now(),
      uploadedBy: user.userId,
    });
    return Response.json({ id, url: `/api/media/${id}`, name: file.name }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не удалось загрузить изображение" }, { status: 500 });
  }
}
