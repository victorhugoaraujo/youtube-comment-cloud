import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LiveWorkspace } from "@/components/dashboard/live-workspace";

export default async function LivePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <LiveWorkspace user={user} youtubeReady={Boolean(process.env.YOUTUBE_API_KEY)} />;
}
