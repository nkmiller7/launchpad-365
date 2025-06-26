"use client";

import { User } from "@supabase/supabase-js";
import { Database } from "../../../types/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { ArrowLeft, Mail, Building, UserCircle, Briefcase, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { getUserTasksClient, deleteTaskClient } from "../../../db/queries";
import dynamic from "next/dynamic";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

interface TaskItem extends TaskRow {
  assigned_by_profile?: {
    full_name: string | null;
    email: string;
  } | null;
}

interface EmployeeDashboardComponentProps {
  manager: User;
  managerProfile: Profile;
  employeeProfile: Profile;
}

// Dynamically import MarkdownRenderer to avoid SSR issues
const MarkdownRenderer = dynamic(() => import("../../dashboard/MarkdownRenderer"), { ssr: false });

export default function EmployeeDashboardComponent({ 
  manager, 
  managerProfile, 
  employeeProfile 
}: EmployeeDashboardComponentProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  // Load employee's tasks
  useEffect(() => {
    loadEmployeeTasks();
  }, [employeeProfile.id]);

  const loadEmployeeTasks = async () => {
    try {
      setLoading(true);
      const employeeTasks = await getUserTasksClient(employeeProfile.id);
      setTasks(employeeTasks as TaskItem[]);
    } catch (error) {
      console.error('Error loading employee tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "manager":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "employee":
        return "bg-green-100 text-green-800 hover:bg-green-200";
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

  const formatTaskDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'skipped': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'skipped': return 'Skipped';
      default: return 'Pending';
    }
  };

  // Sort tasks by due date
  const sortedTasks = tasks.sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  const completedTasksCount = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  // Progress Bar color based on progressPercentage
  const getProgressBarColor = (percentage: number) => {
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-400";
    return "bg-red-500";
  };

  // Delete a task
  const handleDeleteTask = async (taskId: string) => {
    try {
      setDeletingTaskId(taskId);
      await deleteTaskClient(taskId);
      await loadEmployeeTasks(); // Always reload from backend for consistency
    } catch (error) {
      alert("Failed to delete task. Please try again.");
    } finally {
      setDeletingTaskId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild className="text-gray-700">
                <a href="/admin">
                  <ArrowLeft className="text-gray-700 h-4 w-4 mr-2" />
                  Back to Team
                </a>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {employeeProfile.full_name || "Employee"}'s Dashboard
                </h1>                <p className="text-gray-700 mt-1 text-sm">
                  Viewing as manager: {managerProfile.full_name || manager.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Employee Information Card */}
          <Card>            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <UserCircle className="h-5 w-5" />
                Employee Information
              </CardTitle>
              <CardDescription className="text-gray-700">Basic profile and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-700">{employeeProfile.email || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <UserCircle className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Full Name</p>                  <p className="text-sm text-gray-700">
                    {employeeProfile.full_name || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Department</p>                  <p className="text-sm text-gray-700">
                    {employeeProfile.department || "Not assigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Role</p>
                  <Badge className={getRoleBadgeColor(employeeProfile.role || "employee")}>
                    {employeeProfile.role || "employee"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline & Activity Card */}
          <Card>            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Calendar className="h-5 w-5" />
                Account Timeline
              </CardTitle>
              <CardDescription className="text-gray-700">Important dates and milestones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Account Created</p>                <p className="text-sm text-gray-700">
                  {formatDate(employeeProfile.created_at)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Last Updated</p>
                <p className="text-sm text-gray-700">
                  {formatDate(employeeProfile.updated_at)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Manager</p>
                <p className="text-sm text-gray-700">
                  {managerProfile.full_name || manager.email}
                </p></div>
            </CardContent>
          </Card>
        </div>

        {/* Employee's Task Dashboard Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Briefcase className="h-5 w-5" />
                    {employeeProfile.full_name || "Employee"}'s Tasks
                  </CardTitle>
                  <CardDescription className="text-gray-700">Onboarding tasks and progress overview</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{progressPercentage}%</div>                  <div className="text-sm text-gray-700">
                    {completedTasksCount} of {totalTasks} completed
                  </div>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`${getProgressBarColor(progressPercentage)} h-3 rounded-full transition-all duration-300`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-600">Loading tasks...</div>
                </div>
              ) : tasks.length === 0 ? (                <div className="text-center py-8 text-gray-700">
                  No tasks assigned yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'in_progress' ? 'bg-blue-500' :
                          task.status === 'skipped' ? 'bg-gray-400' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <h4 className={`font-medium ${
                            task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <div className="text-sm text-gray-700 mt-1">
                              <MarkdownRenderer content={task.description} />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2 min-w-[120px]">
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusText(task.status)}
                        </Badge>
                        <div className="text-sm text-gray-700 mt-1">
                          {formatTaskDate(task.due_date)}
                        </div>
                        {task.assigned_by_profile && (
                          <div className="text-xs text-gray-400 mt-1">
                            Assigned by {task.assigned_by_profile.full_name || task.assigned_by_profile.email}
                          </div>
                        )}
                        <button
                          className="text-xs text-red-600 hover:underline disabled:opacity-50 mt-2"
                          disabled={deletingTaskId === task.id}
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          {deletingTaskId === task.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
