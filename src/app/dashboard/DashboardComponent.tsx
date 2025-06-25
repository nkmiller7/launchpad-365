'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Database } from '../../types/database';
import { Button } from '../../components/ui/button';
import { Users } from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface DashboardComponentProps {
  user: User;
  profile: Profile | null;
}

// Simplified types for demo
interface TaskItem {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_by?: string;
}

export default function DashboardComponent({ user, profile }: DashboardComponentProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('next-7-days');

  // Sample data for demo
  const sampleTasks: TaskItem[] = [
    {
      id: '1',
      title: 'Security 101',
      description: 'Complete the company security training module',
      due_date: '2025-06-24',
      status: 'pending',
      assigned_by: 'John Manager'
    },
    {
      id: '2',
      title: 'Safety 101',
      description: 'Review workplace safety guidelines and protocols',
      due_date: '2025-06-24',
      status: 'pending',
      assigned_by: 'Sarah HR'
    },
    {
      id: '3',
      title: 'Microsoft Teams Setup',
      description: 'Install and configure Microsoft Teams for communication',
      due_date: '2025-06-26',
      status: 'pending',
      assigned_by: 'Mike IT'
    },
    {
      id: '4',
      title: 'Complete HR Paperwork',
      description: 'Fill out all required HR forms and documentation',
      due_date: '2025-06-28',
      status: 'completed',
      assigned_by: 'Sarah HR'
    },
    {
      id: '5',
      title: 'IT Equipment Setup',
      description: 'Receive and set up your laptop, monitor, and other equipment',
      due_date: '2025-06-25',
      status: 'in_progress',
      assigned_by: 'Mike IT'
    }
  ];

  useEffect(() => {
    setTasks(getFilteredTasks());
  }, [selectedFilter]);

  const getFilteredTasks = (): TaskItem[] => {
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    switch (selectedFilter) {
      case 'next-7-days':
        return sampleTasks.filter(task => {
          const dueDate = new Date(task.due_date);
          return dueDate >= today && dueDate <= sevenDaysFromNow && task.status !== 'completed';
        });
      case 'priority-tasks':
        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(today.getDate() + 3);
        return sampleTasks.filter(task => {
          const dueDate = new Date(task.due_date);
          return dueDate <= threeDaysFromNow && task.status !== 'completed';
        });
      case 'get-started':
        return sampleTasks.filter(task => task.status === 'pending');
      case 'microsoft-tasks':
        return sampleTasks.filter(task => task.title.toLowerCase().includes('microsoft'));
      case 'completed-tasks':
        return sampleTasks.filter(task => task.status === 'completed');
      default:
        return sampleTasks;
    }
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' as const }
          : task
      )
    );
  };

  const completedTasksCount = sampleTasks.filter(task => task.status === 'completed').length;
  const totalTasks = sampleTasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const sidebarItems = [
    { id: 'next-7-days', label: 'Next 7 Days', icon: '📅' },
    { id: 'all-tasks', label: 'All Tasks', icon: '🏠' },
    { id: 'priority-tasks', label: 'Priority Tasks', icon: '❗' },
    { id: 'get-started', label: 'Get Started', icon: '⚫' },
    { id: 'microsoft-tasks', label: 'Microsoft Tasks', icon: '⚫' },
    { id: 'completed-tasks', label: 'Completed Tasks', icon: '✅' },
    { id: 'deleted', label: 'Deleted', icon: '🗑️' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg">
        <div className="p-6">
          {/* Progress Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Progress</h2>
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">👤</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-2">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gray-400 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="text-right text-lg font-semibold text-gray-700">
              {progressPercentage}%
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedFilter(item.id)}
                className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-colors ${
                  selectedFilter === item.id
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            {selectedFilter === 'next-7-days' ? 'Upcoming Tasks' : 
             sidebarItems.find(item => item.id === selectedFilter)?.label || 'Tasks'}
          </h1>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tasks found for this filter.
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => toggleTaskComplete(task.id)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <h3 className={`font-medium ${
                        task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700">
                      {formatDate(task.due_date)}
                    </div>
                    {task.assigned_by && (
                      <div className="text-xs text-gray-500 mt-1">
                        Assigned by {task.assigned_by}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
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
