import { createClient } from "../../db/sbserver";
import { redirect } from "next/navigation";
<<<<<<< HEAD
import DashboardComponent from "./DashboardComponent_simple";
=======
import DashboardComponent from "./DashboardComponent";
>>>>>>> feca1672c04b20c4a6483fc571677de1e9f1713a

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Get the user's profile information
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    // If profile doesn't exist, we might want to create one or show a setup page
  }
  return <DashboardComponent user={user} profile={profile} />;
}
