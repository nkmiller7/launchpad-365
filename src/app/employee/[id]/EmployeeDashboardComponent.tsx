"use client";

import { User } from "@supabase/supabase-js";
import { Database } from "../../../types/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { ArrowLeft, Mail, Building, UserCircle, Briefcase, Calendar } from "lucide-react";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface EmployeeDashboardComponentProps {
  manager: User;
  managerProfile: Profile;
  employeeProfile: Profile;
}

export default function EmployeeDashboardComponent({ 
  manager, 
  managerProfile, 
  employeeProfile 
}: EmployeeDashboardComponentProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "manager":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "employee":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <a href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Team
                </a>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {employeeProfile.full_name || "Employee"}'s Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Viewing as manager: {managerProfile.full_name || manager.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Employee Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                Employee Information
              </CardTitle>
              <CardDescription>Basic profile and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">{employeeProfile.email || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <UserCircle className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Full Name</p>
                  <p className="text-sm text-gray-600">
                    {employeeProfile.full_name || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Department</p>
                  <p className="text-sm text-gray-600">
                    {employeeProfile.department || "Not assigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Role</p>
                  <Badge className={getRoleBadgeColor(employeeProfile.role || "employee")}>
                    {employeeProfile.role || "employee"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline & Activity Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Account Timeline
              </CardTitle>
              <CardDescription>Important dates and milestones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Account Created</p>
                <p className="text-sm text-gray-600">
                  {formatDate(employeeProfile.created_at)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Last Updated</p>
                <p className="text-sm text-gray-600">
                  {formatDate(employeeProfile.updated_at)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Manager</p>
                <p className="text-sm text-gray-600">
                  {managerProfile.full_name || manager.email}
                </p>              </div>            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
