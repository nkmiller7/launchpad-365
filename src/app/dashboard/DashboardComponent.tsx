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
            </div>
            <Button 
              onClick={handleSignOut}
              variant="outline"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.id}</dd>
              </div>
              {profile?.full_name && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.full_name}</dd>
                </div>
              )}
              {profile?.department && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Department</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.department}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Account Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Button 
                onClick={() => router.push('/tests')}
                className="w-full"
              >
                View Tests
              </Button>
              <Button 
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
              >
                Back to Home
              </Button>
              <Button 
                onClick={() => toast({ title: "Coming Soon", description: "This feature is coming soon!" })}
                variant="outline"
                className="w-full"
              >
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
