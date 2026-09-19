import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { AdminEditor } from "@/components/admin-editor";
import { readSiteConfig } from "@/lib/site-store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  const config = await readSiteConfig();
  return <AdminEditor initialConfig={config} userName={user.displayName} />;
}
