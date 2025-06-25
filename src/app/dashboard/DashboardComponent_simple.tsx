'use client';

import React, { useState, useEffect, useMemo } from 'react';

// Simplified types for demo
interface TaskItem {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_by?: string;
}

interface DashboardProps {
  user: any;
  profile: any;
}

export default function DashboardComponent({ user, profile }: DashboardProps) {
  const [selectedFilter, setSelectedFilter] = useState('next-7-days');
  const [loading, setLoading] = useState(false);

  // Single source of truth for all tasks
  const [allTasks, setAllTasks] = useState<TaskItem[]>([
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
  ]);

  // Filtered tasks based on selected filter - using useMemo for better performance
  const tasks = useMemo(() => {
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    switch (selectedFilter) {
      case 'next-7-days':
        return allTasks.filter((task: TaskItem) => {
          const dueDate = new Date(task.due_date);
          return dueDate >= today && dueDate <= sevenDaysFromNow && task.status !== 'completed';
        });
      case 'priority-tasks':
        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(today.getDate() + 3);
        return allTasks.filter((task: TaskItem) => {
          const dueDate = new Date(task.due_date);
          return dueDate <= threeDaysFromNow && task.status !== 'completed';
        });
      case 'get-started':
        return allTasks.filter((task: TaskItem) => task.status === 'pending');
      case 'microsoft-tasks':
        return allTasks.filter((task: TaskItem) => task.title.toLowerCase().includes('microsoft'));
      case 'completed-tasks':
        return allTasks.filter((task: TaskItem) => task.status === 'completed');
      default:
        return allTasks;
    }
  }, [selectedFilter, allTasks]);

  const toggleTaskComplete = (taskId: string) => {
    // Update the task in allTasks state
    setAllTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' as const }
          : task
      )
    );
  };

  // Calculate progress from allTasks state
  const completedTasksCount = allTasks.filter((task: TaskItem) => task.status === 'completed').length;
  const totalTasks = allTasks.length;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-xl border-r border-gray-100">
        <div className="p-6">
          {/* Progress Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">My Progress</h2>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">👤</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="text-right text-xl font-bold text-gray-800">
              {progressPercentage}%
            </div>
            <div className="text-right text-sm text-gray-500 mt-1">
              {completedTasksCount} of {totalTasks} tasks completed
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedFilter(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                  selectedFilter === item.id
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-semibold shadow-sm border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {selectedFilter === 'next-7-days' ? 'Upcoming Tasks' : 
               sidebarItems.find(item => item.id === selectedFilter)?.label || 'Tasks'}
            </h1>
            <p className="text-gray-600">
              {selectedFilter === 'next-7-days' 
                ? 'Tasks due in the next 7 days' 
                : `Showing ${tasks.length} task${tasks.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-6xl mb-4">📋</div>
                <div className="text-gray-500 text-lg">No tasks found for this filter.</div>
                <div className="text-gray-400 text-sm mt-2">Try selecting a different filter from the sidebar.</div>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center justify-between p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => toggleTaskComplete(task.id)}
                        className="w-6 h-6 text-blue-600 border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2 transition-all"
                      />
                      {task.status === 'completed' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-blue-600 text-sm font-bold">✓</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg ${
                        task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800 group-hover:text-blue-700'
                      } transition-colors`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`text-sm mt-1 ${
                          task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end">
                    <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      new Date(task.due_date) < new Date() && task.status !== 'completed'
                        ? 'bg-red-100 text-red-700'
                        : new Date(task.due_date).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000 && task.status !== 'completed'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {formatDate(task.due_date)}
                    </div>
                    {task.assigned_by && (
                      <div className="text-xs text-gray-500 mt-2 bg-gray-50 px-2 py-1 rounded-full">
                        👤 {task.assigned_by}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
