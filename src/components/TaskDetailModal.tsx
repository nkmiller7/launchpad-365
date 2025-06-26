'use client';

import React from 'react';
import { X, Calendar, User, Copy, Check, AlertCircle, FileText, Clock } from "lucide-react"
import { Database } from '../types/database';
import MarkdownRenderer from '../app/dashboard/MarkdownRenderer';

type TaskRow = Database['public']['Tables']['tasks']['Row'];

interface TaskItem extends TaskRow {
  assigned_by_profile?: {
    full_name: string | null;
    email: string;
  } | null;
}

interface TaskDetailModalProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (taskId: string, completed: boolean) => void;
  onCopyLink?: () => void
  copySuccess?: boolean
}

export default function TaskDetailModal({ task, isOpen, onClose, onStatusChange, onCopyLink, copySuccess }: TaskDetailModalProps) {
  if (!isOpen || !task) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'skipped':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      case 'skipped':
        return 'Skipped';
      default:
        return status;
    }
  };  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Task Details</h2>
          <div className="flex items-center space-x-2">
            {onCopyLink && (
              <button
                onClick={onCopyLink}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
              >
                {copySuccess ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title and Status */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-gray-900">{task.title}</h3>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
                {getStatusText(task.status)}
              </span>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={(e) => onStatusChange(task.id, e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-600">Mark as completed</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gray-500" />
                <h4 className="font-medium text-gray-900">Description</h4>
              </div>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                <MarkdownRenderer
                  content={task.description}
                  className="text-sm text-gray-600"
                />
              </p>
            </div>
          )}

          {/* Due Date */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <h4 className="font-medium text-gray-900">Due Date</h4>
            </div>
            <p className="text-gray-700 ml-7">{formatDate(task.due_date)}</p>
          </div>

          {/* Estimated Hours */}
          {task.estimated_hours && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <h4 className="font-medium text-gray-900">Estimated Time</h4>
              </div>
              <p className="text-gray-700 ml-7">{task.estimated_hours} hour{task.estimated_hours !== 1 ? 's' : ''}</p>
            </div>
          )}

          {/* Assigned By */}
          {task.assigned_by_profile && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <h4 className="font-medium text-gray-900">Assigned By</h4>
              </div>
              <p className="text-gray-700 ml-7">
                {task.assigned_by_profile.full_name || task.assigned_by_profile.email}
              </p>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-gray-500" />
                <h4 className="font-medium text-gray-900">Notes</h4>
              </div>
              <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200">{task.notes}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div className="space-y-1">
              <h5 className="text-sm font-medium text-gray-500">Created</h5>
              <p className="text-sm text-gray-700">{formatDateTime(task.created_at)}</p>
            </div>
            <div className="space-y-1">
              <h5 className="text-sm font-medium text-gray-500">Last Updated</h5>
              <p className="text-sm text-gray-700">{formatDateTime(task.updated_at)}</p>
            </div>
            {task.completed_at && (
              <div className="space-y-1 md:col-span-2">
                <h5 className="text-sm font-medium text-gray-500">Completed</h5>
                <p className="text-sm text-gray-700">{formatDateTime(task.completed_at)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
