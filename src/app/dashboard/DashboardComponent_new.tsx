'use client';

import { User } from '@supabase/supabase-js';
import { Database } from '../../types/database';

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
      </div>
    </div>
  );
}
