'use client';

import React, { useState, useEffect, useMemo } from 'react';

// Add custom animations
const customStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  .float-animation {
    animation: float 6s ease-in-out infinite;
  }
  
  .gradient-border {
    background: linear-gradient(45deg, #3B82F6, #8B5CF6, #EC4899);
    background-size: 400% 400%;
    animation: gradientShift 3s ease infinite;
  }
  
  @keyframes gradientShift {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
`;

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

  // Inject custom styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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
    { id: 'next-7-days', label: 'Next 7 Days', icon: '📅', color: 'from-blue-500 via-blue-600 to-cyan-500' },
    { id: 'all-tasks', label: 'All Tasks', icon: '📋', color: 'from-gray-500 via-slate-600 to-gray-700' },
    { id: 'priority-tasks', label: 'Priority Tasks', icon: '🔥', color: 'from-red-500 via-pink-500 to-red-600' },
    { id: 'get-started', label: 'Get Started', icon: '🚀', color: 'from-green-500 via-emerald-500 to-teal-600' },
    { id: 'microsoft-tasks', label: 'Microsoft Tasks', icon: '💼', color: 'from-blue-600 via-indigo-600 to-purple-600' },
    { id: 'completed-tasks', label: 'Completed Tasks', icon: '✅', color: 'from-green-600 via-teal-600 to-emerald-700' },
    { id: 'deleted', label: 'Deleted', icon: '🗑️', color: 'from-gray-400 via-gray-500 to-slate-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-tr from-pink-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Sidebar */}
      <div className="w-80 bg-white/95 backdrop-blur-sm shadow-2xl border-r border-gray-200/50 relative z-10">
        <div className="p-6">
          {/* Progress Section */}
          <div className="mb-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-100/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                My Progress
              </h2>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/25 float-animation">
                  <span className="text-white text-xl">👤</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-700">Overall Completion</span>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-5 shadow-inner overflow-hidden relative">
                <div 
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-5 rounded-full transition-all duration-1000 shadow-sm relative overflow-hidden"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-ping" style={{animationDuration: '3s'}}></div>
                </div>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm"></div>
                <span className="text-gray-700 font-medium">{completedTasksCount} completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full shadow-sm"></div>
                <span className="text-gray-700 font-medium">{totalTasks - completedTasksCount} remaining</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-3">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedFilter(item.id)}
                className={`group w-full flex items-center px-5 py-4 text-left rounded-2xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden ${
                  selectedFilter === item.id
                    ? `bg-gradient-to-r ${item.color} text-white font-semibold shadow-xl`
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-gray-800 bg-gray-50/50 hover:shadow-md'
                }`}
              >
                {/* Animated background for active state */}
                {selectedFilter === item.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent animate-pulse"></div>
                )}
                
                <div className={`mr-4 text-2xl p-3 rounded-xl transition-all duration-300 relative z-10 ${
                  selectedFilter === item.id 
                    ? 'bg-white/20 shadow-inner backdrop-blur-sm' 
                    : 'bg-white shadow-sm group-hover:shadow-lg group-hover:scale-105'
                }`}>
                  <span className={selectedFilter === item.id ? 'animate-bounce' : ''}>{item.icon}</span>
                </div>
                <div className="flex-1 relative z-10">
                  <span className="font-semibold text-sm">{item.label}</span>
                  {selectedFilter === item.id && (
                    <div className="text-xs opacity-90 mt-1 font-medium">
                      {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                {selectedFilter === item.id && (
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-sm relative z-10"></div>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto relative z-10">
        <div className="max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-purple-700 bg-clip-text text-transparent mb-2">
                  {selectedFilter === 'next-7-days' ? 'Upcoming Tasks' : 
                   sidebarItems.find(item => item.id === selectedFilter)?.label || 'Tasks'}
                </h1>
                <p className="text-gray-600 text-lg font-medium">
                  {selectedFilter === 'next-7-days' 
                    ? 'Tasks due in the next 7 days' 
                    : `Showing ${tasks.length} task${tasks.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <div className="bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
                  <span className="text-sm text-gray-600 font-medium">Total Tasks</span>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{totalTasks}</div>
                </div>
                <div className="bg-gradient-to-br from-white/90 to-green-50/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
                  <span className="text-sm text-gray-600 font-medium">Completed</span>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{completedTasksCount}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-white/80 via-blue-50/60 to-purple-50/60 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-8 left-8 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
                <div className="absolute bottom-8 right-8 w-20 h-20 bg-gradient-to-br from-pink-400/20 to-blue-400/20 rounded-full blur-xl"></div>
                
                <div className="relative z-10">
                  <div className="text-8xl mb-6 opacity-60 animate-pulse">📋</div>
                  <div className="text-gray-600 text-2xl font-semibold mb-3">No tasks found</div>
                  <div className="text-gray-500 text-lg">Try selecting a different filter from the sidebar</div>
                </div>
              </div>
            ) : (
              tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="group bg-gradient-to-br from-white/90 via-white/80 to-blue-50/30 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 hover:shadow-2xl hover:border-blue-300/50 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 overflow-hidden relative"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  {/* Subtle background gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/20 to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="flex items-center justify-between p-8 relative z-10">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={task.status === 'completed'}
                          onChange={() => toggleTaskComplete(task.id)}
                          className="w-8 h-8 text-blue-600 border-3 border-gray-300 rounded-xl focus:ring-blue-500 focus:ring-3 transition-all duration-300 cursor-pointer hover:border-blue-400 hover:scale-110"
                        />
                        {task.status === 'completed' && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-white text-xl font-bold animate-bounce">✓</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold text-xl mb-3 transition-all duration-300 ${
                          task.status === 'completed' 
                            ? 'line-through text-gray-400' 
                            : 'text-gray-800 group-hover:text-blue-700 group-hover:scale-105'
                        }`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className={`text-base leading-relaxed ${
                            task.status === 'completed' ? 'text-gray-400' : 'text-gray-600 group-hover:text-gray-700'
                          }`}>
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col items-end space-y-4">
                      <div className={`text-sm font-bold px-5 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 border ${
                        new Date(task.due_date) < new Date() && task.status !== 'completed'
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-500/30 border-red-300/50'
                          : new Date(task.due_date).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000 && task.status !== 'completed'
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-yellow-500/30 border-yellow-300/50'
                          : task.status === 'completed'
                          ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-green-500/30 border-green-300/50'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 shadow-gray-500/20 border-gray-300/50'
                      }`}>
                        {formatDate(task.due_date)}
                      </div>
                      {task.assigned_by && (
                        <div className="flex items-center space-x-3 text-sm text-gray-600 bg-gradient-to-r from-gray-100/90 to-blue-100/90 px-4 py-3 rounded-xl border border-gray-200/70 shadow-sm hover:shadow-md transition-all duration-300">
                          <div className="w-7 h-7 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white text-sm">👤</span>
                          </div>
                          <span className="font-semibold">{task.assigned_by}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Enhanced bottom accent */}
                  <div className="h-1 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 group-hover:from-blue-500/50 group-hover:via-purple-500/50 group-hover:to-pink-500/50 transition-all duration-500"></div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
