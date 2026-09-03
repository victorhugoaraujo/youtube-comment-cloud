import { getCurrentUser } from "@/lib/auth";
import { VideoWorkspace } from "@/components/dashboard/video-workspace";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <VideoWorkspace user={user} />;
}
