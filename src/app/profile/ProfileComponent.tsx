"use client";

import { User } from "@supabase/supabase-js";
import { Database } from "../../types/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Mail, Building, UserCircle, Briefcase, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "../../db/sbclient";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileComponentProps {
  user: User;
  profile: Profile | null;
}

export default function ProfileComponent({ user, profile }: ProfileComponentProps) {
  const [managerProfile, setManagerProfile] = useState<Profile | null>(null);
  const [isLoadingManager, setIsLoadingManager] = useState(false);
  // Fetch manager profile if user is an individual contributor and has a manager_id
  useEffect(() => {
    const fetchManagerProfile = async () => {
      if (profile?.role === "individual contributor" && profile?.manager_id) {
        setIsLoadingManager(true);
        try {
          const supabase = createClient();
          const { data: manager, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', profile.manager_id)
            .single();
          
          if (error) throw error;
          setManagerProfile(manager);
        } catch (error) {
          console.error("Error fetching manager profile:", error);
          setManagerProfile(null);
        } finally {
          setIsLoadingManager(false);
        }
      }
    };

    fetchManagerProfile();
  }, [profile?.manager_id, profile?.role]);
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "manager":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "employee":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "individual contributor":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "hr":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">View and manage your profile information</p>
      </div>

      <div className="flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Your basic profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-600">{user.email || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <UserCircle className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Full Name</p>
                <p className="text-sm text-gray-600">
                  {profile?.full_name || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Department</p>
                <p className="text-sm text-gray-600">
                  {profile?.department || "Not assigned"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Role</p>
                <Badge className={getRoleBadgeColor(profile?.role || "employee")}>
                  {profile?.role || "employee"}
                </Badge>
              </div>
            </div>          </CardContent>
        </Card>
      </div>

      {/* Account Timeline */}
      <div className="flex justify-center mt-6">
        <Card className="w-full max-w-2xl">
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
                {formatDate(profile?.created_at || user.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Last Updated</p>
              <p className="text-sm text-gray-600">
                {formatDate(profile?.updated_at || null)}
              </p>
            </div>            {profile?.role === "individual contributor" && profile?.manager_id && (
              <div>
                <p className="text-sm font-medium text-gray-900">Reports To</p>
                <p className="text-sm text-gray-600">
                  {isLoadingManager 
                    ? "Loading..." 
                    : managerProfile?.full_name || "Manager information not available"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {!profile && (
        <div className="flex justify-center mt-6">
          <div className="w-full max-w-2xl p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Profile Setup Required:</strong> Your profile information is incomplete.
              Please contact your manager to complete your profile setup.
            </p>
          </div>
        </div>
      )}
        <div className="mt-8 text-center">
        <Button variant="outline" asChild>
          <a href="/dashboard">Back to Dashboard</a>
        </Button>
      </div>
    </div>
  );
}
