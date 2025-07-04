"use client";

import { User } from "@supabase/supabase-js";
import { Database } from "../../types/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Users, Eye, UserCircle, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { getUserTasksClient } from "../../db/queries";
import TaskAssignmentModal from "../../components/TaskAssignmentModal";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface EmployeeProgress {
  employeeId: string;
  completedTasks: number;
  totalTasks: number;
  progressPercentage: number;
}

interface AdminComponentProps {
  user: User;
  profile: Profile;
  employees: Profile[];
}

export default function AdminComponent({ user, profile, employees }: AdminComponentProps) {
  const [employeeProgress, setEmployeeProgress] = useState<Map<string, EmployeeProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Load progress for all employees
  useEffect(() => {
    loadAllEmployeeProgress();
  }, [employees]);

  const loadAllEmployeeProgress = async () => {
    try {
      setLoading(true);
      const progressMap = new Map<string, EmployeeProgress>();

      // Load tasks for each employee
      await Promise.all(
        employees.map(async (employee) => {
          try {
            const tasks = await getUserTasksClient(employee.id);
            const completedTasks = tasks.filter(task => task.status === 'completed').length;
            const totalTasks = tasks.length;
            const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            progressMap.set(employee.id, {
              employeeId: employee.id,
              completedTasks,
              totalTasks,
              progressPercentage
            });
          } catch (error) {
            console.error(`Error loading tasks for employee ${employee.id}:`, error);
            // Set default progress for employees with errors
            progressMap.set(employee.id, {
              employeeId: employee.id,
              completedTasks: 0,
              totalTasks: 0,
              progressPercentage: 0
            });
          }
        })
      );

      setEmployeeProgress(progressMap);
    } catch (error) {
      console.error('Error loading employee progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeProgress = (employeeId: string): EmployeeProgress => {
    return employeeProgress.get(employeeId) || {
      employeeId,
      completedTasks: 0,
      totalTasks: 0,
      progressPercentage: 0
    };
  };

  // Progress Bar color based on progressPercentage
  const getProgressBarColor = (percentage: number) => {
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-400";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Manager Dashboard
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-700">
                Welcome back, {profile.full_name || user.email}. Manage your team below.
              </p>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <Button variant="outline" className="text-black" asChild>
                <a href="/profile">My Profile</a>
              </Button>
              <Button variant="outline" className="text-black" asChild>
                <a href="/dashboard">My Dashboard</a>
              </Button>
            </div>
          </div>
        </div>

        {/* Employee List */}        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Your Team ({employees.length} employees)
                </h2>
                <p className="mt-1 text-sm text-gray-700">
                  Click on any employee to view their dashboard
                </p>
              </div>              <Button 
                onClick={() => setIsTaskModalOpen(true)}
                variant="outline"
                className="flex items-center gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
                disabled={employees.length === 0}
              >
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>
          </div>
          
          <div className="px-4 py-4">
            {employees.length === 0 ? (
              <div className="text-center py-8">
                <UserCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700">No employees assigned yet</p>
              </div>
            ) : (              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {employees.map((employee) => {
                  const progress = getEmployeeProgress(employee.id);
                  return (
                    <Card key={employee.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">                        <CardTitle className="text-lg flex items-center gap-2">
                          <UserCircle className="text-gray-700 h-4 w-4" />
                          <span className="text-gray-700">{employee.full_name || "No name set"}</span>
                        </CardTitle>
                        <CardDescription>
                          <span className="text-gray-700">{employee.department || "No department"}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Role:</span> {employee.role || "employee"}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Joined:</span>{" "}
                            {employee.created_at 
                              ? new Date(employee.created_at).toLocaleDateString()
                              : "Unknown"
                            }
                          </p>
                        </div>
                        {/* Progress Section */}
                        <div className="mb-4 space-y-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${getProgressBarColor(progress.progressPercentage)} h-2 rounded-full transition-all duration-500 ease-out`}
                              style={{ 
                                width: loading ? '0%' : `${progress.progressPercentage}%` 
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-700">
                            {loading ? "Loading..." : `${progress.completedTasks} of ${progress.totalTasks} tasks completed`}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            asChild
                          >
                            <a href={`/employee/${employee.id}`} className="flex items-center gap-2">
                              <Eye className="text-gray-700 h-4 w-4" />
                              <span className="text-gray-700">View Dashboard</span>
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>        {/* Quick Actions */}
        {/* Removed the old location of My Profile and My Dashboard buttons */}

        {/* Task Assignment Modal */}
        <TaskAssignmentModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          employees={employees}
          currentUser={user}
          onTaskAssigned={() => {
            // Refresh employee progress after task assignment
            loadAllEmployeeProgress();
            setIsTaskModalOpen(false);
          }}
        />
      </div>
    </div>
  );
}
