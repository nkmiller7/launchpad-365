'use client';

import { User } from '@supabase/supabase-js';
import { Database } from '../../types/database';
import { Button } from '../../components/ui/button';
import { Users } from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface DashboardComponentProps {
  user: User;
  profile: Profile | null;
}

export default function DashboardComponent({ user, profile }: DashboardComponentProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome to your Dashboard!
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Hello, {user.email}
            </p>
          </div>
        </div>

        {/* Manager Panel Link */}
        {profile?.role === 'manager' && (
          <div className="mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-blue-900">Manager Tools</h3>
                  <p className="text-sm text-blue-700">
                    Access your team management dashboard to view and manage your employees.
                  </p>
                </div>
                <Button asChild>
                  <a href="/admin">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Team
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Quick Links</h2>
              <div className="mt-4 flex gap-4">
                <Button variant="outline" asChild>
                  <a href="/profile">View Profile</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
