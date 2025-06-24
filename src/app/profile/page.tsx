import { createClient } from "../../db/sbserver";
import { redirect } from "next/navigation";
import ProfileComponent from "./ProfileComponent_new";

export default async function ProfilePage() {
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

  return <ProfileComponent user={user} profile={profile} />;
}
