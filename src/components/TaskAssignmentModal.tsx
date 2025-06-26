"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Database } from "../types/database";
import {
  getTaskTemplatesClient,
  createTaskTemplateClient,
  assignTaskFromTemplateClient,
  createAndAssignTaskClient,
} from "../db/queries";
import { User } from "@supabase/supabase-js";
import { Plus, FileText, PlusCircle } from "lucide-react";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type TaskTemplate = Database["public"]["Tables"]["task_templates"]["Row"];

interface TaskAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Profile[];
  currentUser: User;
  onTaskAssigned?: () => void;
}

type AssignmentMode = "existing" | "new" | "custom";

export default function TaskAssignmentModal({
  isOpen,
  onClose,
  employees,
  currentUser,
  onTaskAssigned,
}: TaskAssignmentModalProps) {
  const [mode, setMode] = useState<AssignmentMode>("existing");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  // New template form
  const [newTemplate, setNewTemplate] = useState({
    title: "",
    description: "",
    estimatedHours: "",
    department: "",
  });
  // Track template creation loading state
  const [templateCreating, setTemplateCreating] = useState(false);

  // Custom task form
  const [customTask, setCustomTask] = useState({
    title: "",
    description: "",
    estimatedHours: "",
    dueDate: "",
  });

  // Load templates when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const data = await getTaskTemplatesClient();
      setTemplates(data);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const resetForm = () => {
    setMode("existing");
    setSelectedEmployee("");
    setSelectedTemplate("");
    setNewTemplate({
      title: "",
      description: "",
      estimatedHours: "",
      department: "",
    });
    setCustomTask({
      title: "",
      description: "",
      estimatedHours: "",
      dueDate: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAssignExistingTemplate = async () => {
    if (!selectedTemplate || !selectedEmployee) return;

    try {
      setLoading(true);
      // Workaround: always set due date to the next day to compensate for off-by-one bug
      let dueDate = customTask.dueDate
        ? (() => {
            const d = new Date(customTask.dueDate);
            d.setDate(d.getDate() + 1);
            return d.toISOString().slice(0, 10);
          })()
        : undefined;
      await assignTaskFromTemplateClient(
        selectedTemplate,
        selectedEmployee,
        currentUser.id,
        dueDate
      );
      onTaskAssigned?.();
      handleClose();
    } catch (error) {
      console.error("Error assigning task:", error);
      alert("Failed to assign task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Only create the template, do not assign
  const handleCreateTemplate = async () => {
    if (!newTemplate.title) return;
    try {
      setTemplateCreating(true);
      await createTaskTemplateClient({
        title: newTemplate.title,
        description: newTemplate.description || undefined,
        estimated_hours: newTemplate.estimatedHours ? parseInt(newTemplate.estimatedHours) : undefined,
        department: newTemplate.department || undefined,
        created_by: currentUser.id,
      });
      loadTemplates(); // Refresh templates list
      handleClose();
    } catch (error) {
      console.error("Error creating template:", error);
      alert("Failed to create template. Please try again.");
    } finally {
      setTemplateCreating(false);
    }
  };

  const handleAssignCustomTask = async () => {
    if (!customTask.title || !selectedEmployee) return;

    try {
      setLoading(true);
      // Workaround: always set due date to the next day to compensate for off-by-one bug
      let dueDate = customTask.dueDate
        ? (() => {
            const d = new Date(customTask.dueDate);
            d.setDate(d.getDate() + 1);
            return d.toISOString().slice(0, 10);
          })()
        : undefined;
      await createAndAssignTaskClient({
        title: customTask.title,
        description: customTask.description || undefined,
        estimated_hours: customTask.estimatedHours ? parseInt(customTask.estimatedHours) : undefined,
        assigned_to: selectedEmployee,
        assigned_by: currentUser.id,
        due_date: dueDate,
      });

      onTaskAssigned?.();
      handleClose();
    } catch (error) {
      console.error("Error assigning custom task:", error);
      alert("Failed to assign custom task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    switch (mode) {
      case "existing":
        handleAssignExistingTemplate();
        break;
      case "new":
        handleCreateTemplate();
        break;
      case "custom":
        handleAssignCustomTask();
        break;
    }
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {mode === "new" ? "Create Template" : "Assign Task"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {mode === "new"
              ? "Create a reusable task template for future assignments."
              : "Choose how you'd like to assign a task to your team member."}
          </DialogDescription>
        </DialogHeader>        <div className="space-y-6 py-4">
          {/* Employee Selection - hide for 'new' mode */}
          {mode !== "new" && (
            <div className="space-y-2">
              <Label htmlFor="employee" className="text-sm font-medium text-gray-900">Assign to Employee</Label>            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select an employee" className="text-gray-900" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id} className="text-gray-900 hover:bg-gray-100">
                      {employee.full_name || employee.email}
                      {employee.department && ` (${employee.department})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}          {/* Assignment Mode Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">Task Assignment Method</Label>
            <div className="grid grid-cols-1 gap-3">
              <Card
                className={`cursor-pointer transition-all border ${
                  mode === "existing" 
                    ? "border-blue-500 bg-blue-50 shadow-sm" 
                    : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
                }`}
                onClick={() => setMode("existing")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-gray-900">
                    <FileText className="h-4 w-4 text-gray-600" />
                    Use Existing Template
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-xs text-gray-600">
                    Select from pre-made task templates
                  </CardDescription>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all border ${
                  mode === "new" 
                    ? "border-blue-500 bg-blue-50 shadow-sm" 
                    : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
                }`}
                onClick={() => setMode("new")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-gray-900">
                    <Plus className="h-4 w-4 text-gray-600" />
                    Create New Template
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-xs text-gray-600">
                    Create a reusable template and assign it
                  </CardDescription>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all border ${
                  mode === "custom" 
                    ? "border-blue-500 bg-blue-50 shadow-sm" 
                    : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
                }`}
                onClick={() => setMode("custom")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-gray-900">
                    <PlusCircle className="h-4 w-4 text-gray-600" />
                    Custom One-time Task
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-xs text-gray-600">
                    Create a one-time task without saving as template
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>          {/* Mode-specific Forms */}
          {mode === "existing" && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
              <div className="space-y-2">
                <Label htmlFor="template" className="text-sm font-medium text-gray-900">Select Template</Label>                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder={templatesLoading ? "Loading templates..." : "Select a template"} className="text-gray-900" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id} className="text-gray-900 hover:bg-gray-100">
                        {template.title}
                        {template.department && ` (${template.department})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplateData && (
                <Card className="bg-white border-gray-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-900">Template Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedTemplateData.title}</p>
                      {selectedTemplateData.description && (
                        <p className="text-xs text-gray-600 mt-1">{selectedTemplateData.description}</p>
                      )}
                    </div>
                    {selectedTemplateData.estimated_hours && (
                      <p className="text-xs text-gray-500">
                        Estimated: {selectedTemplateData.estimated_hours} hours
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
              {/* Due Date Picker for Existing Template Assignment */}
              <div className="space-y-2">
                <Label htmlFor="existingDueDate" className="text-sm font-medium text-gray-900">Due Date</Label>
                <Input
                  id="existingDueDate"
                  type="date"
                  value={customTask.dueDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>
          )}          {mode === "new" && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-900">Template Title</Label>                <Input
                  id="title"
                  value={newTemplate.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter template title"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-900">Description</Label>                <Textarea
                  id="description"
                  value={newTemplate.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter template description"
                  rows={3}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hours" className="text-sm font-medium text-gray-900">Estimated Hours</Label>                  <Input
                    id="hours"
                    type="number"
                    value={newTemplate.estimatedHours}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTemplate(prev => ({ ...prev, estimatedHours: e.target.value }))}
                    placeholder="0"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept" className="text-sm font-medium text-gray-900">Department</Label>                  <Input
                    id="dept"
                    value={newTemplate.department}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTemplate(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Department (optional)"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>
          )}          {mode === "custom" && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
              <div className="space-y-2">
                <Label htmlFor="customTitle" className="text-sm font-medium text-gray-900">Task Title</Label>                <Input
                  id="customTitle"
                  value={customTask.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customDescription" className="text-sm font-medium text-gray-900">Description</Label>                <Textarea
                  id="customDescription"
                  value={customTask.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter task description"
                  rows={3}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customHours" className="text-sm font-medium text-gray-900">Estimated Hours</Label>                  <Input
                    id="customHours"
                    type="number"
                    value={customTask.estimatedHours}                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomTask(prev => ({ ...prev, estimatedHours: e.target.value }))}
                    placeholder="0"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-sm font-medium text-gray-900">Due Date</Label>                  <Input
                    id="dueDate"
                    type="date"
                    value={customTask.dueDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>        <DialogFooter className="border-t border-gray-200 pt-4 mt-6">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={
              (mode === "new" ? templateCreating : loading) ||
              (mode !== "new" && !selectedEmployee) ||
              (mode === "existing" && !selectedTemplate) ||
              (mode === "new" && !newTemplate.title) ||
              (mode === "custom" && !customTask.title)
            }
            className="bg-blue-600 border:gray-300 text-gray-700 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
          >
            {mode === "new"
              ? (templateCreating ? "Creating..." : "Create Template")
              : (loading ? "Assigning..." : "Assign Task")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
