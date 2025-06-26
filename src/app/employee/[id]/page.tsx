import { createClient } from "../../../db/sbserver";
import { redirect } from "next/navigation";
import EmployeeDashboardComponent from "./EmployeeDashboardComponent";

interface EmployeePageProps {
  params: {
    id: string;
  };
}

export default async function EmployeePage({ params }: EmployeePageProps) {
  const supabase = await createClient();
  const { id } = params;

  // Get the current user (manager)
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Get the manager's profile using the current user's id
  const { data: managerProfile, error: managerProfileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (managerProfileError || !managerProfile || managerProfile.role !== "manager") {
    redirect("/dashboard");
  }

  // Get the employee's profile using the id param
  const { data: employeeProfile, error: employeeError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (employeeError || !employeeProfile) {
    console.error("Error fetching employee:", employeeError);
    redirect("/admin");
  }

  // Verify this employee reports to this manager
  if (employeeProfile.manager_id !== user.id) {
    redirect("/admin");
  }

  return <EmployeeDashboardComponent 
    manager={user}
    managerProfile={managerProfile}
    employeeProfile={employeeProfile}
  />;
}
