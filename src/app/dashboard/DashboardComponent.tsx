'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Database } from '../../types/database';
import { Button } from '../../components/ui/button';
import { Users, Bot, X, UserCircle, Briefcase, Calendar, Building } from 'lucide-react';

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
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

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
            )}          </div>
        </div>        {/* AI Assistant Floating Button */}
        <div 
          className="fixed bottom-6 right-6 z-[9999]"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            pointerEvents: 'auto'
          }}
        >
          <Button 
            onClick={() => {
              console.log("AI Assistant button clicked!");
              setIsAIAssistantOpen(!isAIAssistantOpen);
            }}
            className="rounded-full w-16 h-16 shadow-2xl transition-all duration-200 hover:scale-105 border-4 border-white"
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              minWidth: '64px',
              minHeight: '64px'
            }}
          >
            <Bot className="h-8 w-8" />
          </Button>
        </div>

        {/* Test visibility element */}
        <div 
          style={{
            position: 'fixed',
            top: '50%',
            right: '24px',
            backgroundColor: 'red',
            color: 'white',
            padding: '10px',
            zIndex: 9999,
            borderRadius: '8px'
          }}
        >
          TEST - Can you see this?
        </div>

        {/* AI Assistant Popup */}
        {isAIAssistantOpen && (
          <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsAIAssistantOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Hi! I'm here to help you with your onboarding tasks and answer any questions. What can I assist you with today?
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-sm">
                  <UserCircle className="h-4 w-4 mr-2" />
                  Task Help & Guidance
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Company Resources
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Questions
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm">
                  <Building className="h-4 w-4 mr-2" />
                  General Support
                </Button>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                  Start Conversation
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
