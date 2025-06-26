'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation"
import { User } from '@supabase/supabase-js';
import { Database } from '../../types/database';
import { Button } from '../../components/ui/button';
import { Users, Calendar, Briefcase, UserCircle, ClipboardList, Flame, Rocket, CheckCircle, Check, Copy } from 'lucide-react';
import { getUserTasksClient, updateTaskStatusClient } from '../../db/queries';
import TaskDetailModal from '../../components/TaskDetailModal';
import AIAssistant from '../../components/AIAssistant';
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import MarkdownRenderer from './MarkdownRenderer';

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [allTasks, setAllTasks] = useState<TaskItem[]>([])
  const [selectedFilter, setSelectedFilter] = useState("next-7-days")
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false)

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

  // Handle URL parameters for task selection
  useEffect(() => {
    const taskId = searchParams.get("task")
    if (taskId && allTasks.length > 0) {
      const task = allTasks.find((t) => t.id === taskId)
      if (task) {
        setSelectedTask(task)
        setIsTaskModalOpen(true)
      }
    }
  }, [searchParams, allTasks])

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
      );    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleTaskClick = (task: TaskItem) => {
    // Update URL to include task ID
    const url = new URL(window.location.href)
    url.searchParams.set("task", task.id)
    router.push(url.pathname + url.search, { scroll: false })

    setSelectedTask(task)
    setIsTaskModalOpen(true)
  }

  const handleCloseTaskModal = () => {
    // Remove task parameter from URL
    const url = new URL(window.location.href)
    url.searchParams.delete("task")
    router.push(url.pathname + url.search, { scroll: false })

    setIsTaskModalOpen(false)
    setSelectedTask(null)
  }

  const handleTaskStatusChange = async (taskId: string, completed: boolean) => {
    await toggleTaskComplete(taskId)

    // If task is marked as completed, close the modal
    if (completed) {
      setIsTaskModalOpen(false)
      setSelectedTask(null)
      // Remove task parameter from URL
      const url = new URL(window.location.href)
      url.searchParams.delete("task")
      router.push(url.pathname + url.search, { scroll: false })
    } else {
      // Update the selected task if it's still open and not completed
      if (selectedTask && selectedTask.id === taskId) {
        const updatedTask = allTasks.find((t) => t.id === taskId)
        if (updatedTask) {
          setSelectedTask(updatedTask)
        }
      }
    }
  }

  const copyTaskLink = async (taskId: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set("task", taskId)
    const taskUrl = url.toString()

    try {
      await navigator.clipboard.writeText(taskUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = taskUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

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
    { id: 'next-7-days', label: 'Next 7 Days', icon: <Calendar className="h-5 w-5" /> },
    { id: 'all-tasks', label: 'All Tasks', icon: <ClipboardList className="h-5 w-5" /> },
    { id: 'priority-tasks', label: 'Priority Tasks', icon: <Flame className="h-5 w-5 text-orange-500" /> },
    { id: 'get-started', label: 'Get Started', icon: <Rocket className="h-5 w-5 text-blue-500" /> },
    { id: 'microsoft-tasks', label: 'Microsoft Tasks', icon: <Briefcase className="h-5 w-5 text-blue-700" /> },
    { id: 'completed-tasks', label: 'Completed Tasks', icon: <CheckCircle className="h-5 w-5 text-green-600" /> },
  ];

  useEffect(() => {
    // Show confetti when all upcoming tasks are completed
    if (selectedFilter === 'next-7-days' && tasks.length === 0 && tasks.every(task => task.status === 'completed')) {
      setShowConfetti(true);
      // Hide confetti after 4 seconds
      const timeout = setTimeout(() => setShowConfetti(false), 10000);
      return () => clearTimeout(timeout);
    } else {
      setShowConfetti(false);
    }
  }, [tasks, selectedFilter]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Confetti overlay - covers the whole viewport */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={200}
          recycle={false}
          className="fixed inset-0 z-[100] pointer-events-none"
        />
      )}
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg border-r border-gray-200/50">
        <div className="p-6">
          {/* Progress Section */}
          <div className="mb-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Onboarding Progress</h2>
              <div className="relative">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow">
                  <UserCircle className="h-7 w-7 text-blue-700" />
                </div>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Completion</span>
                <span className="text-xs font-semibold text-blue-700">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full transition-all duration-700" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{completedTasksCount} completed</span>
              <span>{totalTasks - completedTasksCount} remaining</span>
            </div>
          </div>
          {/* Navigation */}
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedFilter(item.id)}
                className={`group w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200 bg-white hover:bg-blue-50 ${
                  selectedFilter === item.id
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold shadow-sm'
                    : 'text-gray-700'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium text-base">{item.label}</span>
                {selectedFilter === item.id && (
                  <span className="ml-auto text-xs text-blue-700 font-semibold">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-gray-600">Loading your tasks...</div>
          </div>        ) : (
          <div className="max-w-4xl">
            {/* Manager Panel Link */}
            {profile?.role === 'manager' && (
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-blue-900">Manager Tools</h3>
                      <p className="text-sm text-blue-700">
                        Access your team management dashboard to view and manage your employees.
                      </p>
                    </div>
                    <Button asChild>
                      <a href="/admin" className='text-blue-900'>
                        <Users className="text-blue-900 h-4 w-4 mr-2" />
                        Manage Team
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <h1 className="text-2xl font-bold text-gray-900 mb-8">
              {selectedFilter === 'next-7-days' ? 'Upcoming Tasks' : 
               sidebarItems.find(item => item.id === selectedFilter)?.label || 'Tasks'}
            </h1>

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No tasks found for this filter.</div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={task.status === "completed"}
                        onChange={(e) => {
                          e.stopPropagation() // Prevent modal from opening when clicking checkbox
                          toggleTaskComplete(task.id)
                        }}
                        onClick={(e) => {
                          e.stopPropagation() // Also prevent on click event
                        }}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <h3
                          className={`font-medium ${
                            task.status === "completed" ? "line-through text-gray-500" : "text-gray-900"
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <div className="mt-1">
                            <MarkdownRenderer
                              content={task.description}
                              truncate={true}
                              maxLength={100}
                              className="text-sm text-gray-600"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-700">{formatDate(task.due_date)}</div>
                        {task.assigned_by_profile && (
                          <div className="text-xs text-gray-500 mt-1">
                            Assigned by {task.assigned_by_profile.full_name || task.assigned_by_profile.email}
                          </div>
                        )}
                      </div>

                      {/* Copy Link Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyTaskLink(task.id)
                        }}
                        title="Copy task link"
                      >
                        {copySuccess ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant Component */}
      <AIAssistant />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        onStatusChange={handleTaskStatusChange}
        onCopyLink={selectedTask ? () => copyTaskLink(selectedTask.id) : undefined}
        copySuccess={copySuccess}
      />
    </div>
  );
}
