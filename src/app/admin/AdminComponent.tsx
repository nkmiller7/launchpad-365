"use client";

import { User } from "@supabase/supabase-js";
import { Database } from "../../types/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Users, Eye, UserCircle } from "lucide-react";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AdminComponentProps {
  user: User;
  profile: Profile;
  employees: Profile[];
}

export default function AdminComponent({ user, profile, employees }: AdminComponentProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Manager Dashboard
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Welcome back, {profile.full_name || user.email}. Manage your team below.
            </p>
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Team ({employees.length} employees)
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Click on any employee to view their dashboard
            </p>
          </div>
          
          <div className="px-4 py-4">
            {employees.length === 0 ? (
              <div className="text-center py-8">
                <UserCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No employees assigned yet</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {employees.map((employee) => (
                  <Card key={employee.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <UserCircle className="h-4 w-4" />
                        {employee.full_name || "No name set"}
                      </CardTitle>
                      <CardDescription>
                        {employee.department || "No department"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Role:</span> {employee.role || "employee"}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Joined:</span>{" "}
                          {employee.created_at 
                            ? new Date(employee.created_at).toLocaleDateString()
                            : "Unknown"
                          }
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        asChild
                      >
                        <a href={`/employee/${employee.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Dashboard
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-4 justify-center">
          <Button variant="outline" asChild>
            <a href="/profile">My Profile</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/dashboard">My Dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
