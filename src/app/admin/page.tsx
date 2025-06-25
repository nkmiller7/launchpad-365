import { createClient } from "../../db/sbserver";
import { redirect } from "next/navigation";
import AdminComponent from "./AdminComponent";

export default async function AdminPage() {
  const supabase = await createClient();

  // Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Get the user's profile to check if they're a manager
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("Error fetching profile:", profileError);
    redirect("/dashboard");
  }

  // Only allow managers to access this page
  if (profile.role !== "manager") {
    redirect("/dashboard");
  }

  // Get all employees under this manager (assuming there's a manager_id field)
  const { data: employees, error: employeesError } = await supabase
    .from("profiles")
    .select("*")
    .eq("manager_id", user.id);

  if (employeesError) {
    console.error("Error fetching employees:", employeesError);
  }

  return <AdminComponent user={user} profile={profile} employees={employees || []} />;
}
