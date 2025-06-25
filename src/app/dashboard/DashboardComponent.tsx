'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Database } from '../../types/database';
import { Button } from '../../components/ui/button';
import { Users } from 'lucide-react';
import { getUserTasksClient, updateTaskStatusClient } from '../../db/queries';

type Profile = Database['public']['Tables']['profiles']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];

interface DashboardComponentProps {
  user: User;
  profile: Profile | null;
}

// Updated to match database structure
interface TaskItem extends TaskRow {
  assigned_by_profile?: {
    full_name: string | null;
    email: string;
  } | null;
}

export default function DashboardComponent({ user, profile }: DashboardComponentProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [allTasks, setAllTasks] = useState<TaskItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('next-7-days');
  const [loading, setLoading] = useState(true);

  // Load tasks from Supabase
  useEffect(() => {
    loadUserTasks();
  }, [user.id]);
  const loadUserTasks = async () => {
    try {
      setLoading(true);
      const userTasks = await getUserTasksClient(user.id);
      setAllTasks(userTasks as TaskItem[]);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTasks(getFilteredTasks());
  }, [selectedFilter, allTasks]);
  const getFilteredTasks = (): TaskItem[] => {
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    let filteredTasks: TaskItem[] = [];

    switch (selectedFilter) {
      case 'next-7-days':
        filteredTasks = allTasks.filter(task => {
          if (!task.due_date) return false;
          const dueDate = new Date(task.due_date);
          return dueDate >= today && dueDate <= sevenDaysFromNow && task.status !== 'completed';
        });
        break;
      case 'priority-tasks':
        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(today.getDate() + 3);
        filteredTasks = allTasks.filter(task => {
          if (!task.due_date) return false;
          const dueDate = new Date(task.due_date);
          return dueDate <= threeDaysFromNow && task.status !== 'completed';
        });
        break;
      case 'get-started':
        filteredTasks = allTasks.filter(task => task.status === 'pending');
        break;
      case 'microsoft-tasks':
        filteredTasks = allTasks.filter(task => task.title.toLowerCase().includes('microsoft'));
        break;
      case 'completed-tasks':
        filteredTasks = allTasks.filter(task => task.status === 'completed');
        break;
      case 'all-tasks':
        filteredTasks = allTasks;
        break;
      default:
        filteredTasks = allTasks;
    }

    // Sort by due date - tasks with due dates first (earliest first), then tasks without due dates
    return filteredTasks.sort((a, b) => {
      // Tasks without due dates go to the end
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      
      // Compare due dates (earliest first)
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
  };

  const toggleTaskComplete = async (taskId: string) => {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      try {
      await updateTaskStatusClient(taskId, newStatus);
      
      // Update local state
      setAllTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId ? { ...t, status: newStatus } : t
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const completedTasksCount = allTasks.filter(task => task.status === 'completed').length;
  const totalTasks = allTasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
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
      </div>      {/* Main Content */}
      <div className="flex-1 p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-gray-600">Loading your tasks...</div>
          </div>
        ) : (
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
                      {task.assigned_by_profile && (
                        <div className="text-xs text-gray-500 mt-1">
                          Assigned by {task.assigned_by_profile.full_name || task.assigned_by_profile.email}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
