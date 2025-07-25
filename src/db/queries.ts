import { createClient } from './sbclient';

// Profile operations
export async function getUserProfile(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
}

export async function createUserProfile(profile: {
  id: string;
  email: string;
  full_name?: string;
  role?: 'manager' | 'employee' | 'individual contributor' | 'hr';
  department?: string;
  hire_date?: string;
  manager_id?: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, updates: {
  full_name?: string;
  role?: 'manager' | 'employee' | 'individual contributor' | 'hr';
  department?: string;
  hire_date?: string;
  manager_id?: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Task operations
export async function getUserTasks(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      assigned_by_profile:profiles!tasks_assigned_by_fkey(*),
      task_template:task_templates(*)
    `)
    .eq('assigned_to', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function getTasksAssignedByUser(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      assigned_to_profile:profiles!tasks_assigned_to_fkey(*),
      task_template:task_templates(*)
    `)
    .eq('assigned_by', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function createTask(task: {
  title: string;
  description?: string;
  estimated_hours?: number;
  assigned_to: string;
  assigned_by: string;
  task_template_id?: string;
  task_group_id?: string;
  due_date?: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateTaskStatus(
  taskId: string, 
  status: 'pending' | 'in_progress' | 'completed' | 'skipped',
  notes?: string
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .update({ status, notes })
    .eq('id', taskId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Delete a task by ID
export async function deleteTaskClient(taskId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  if (error) throw error;
  return true;
}

// Task template operations
export async function getTaskTemplates(department?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('task_templates')
    .select('*')
    .order('title');
    
  if (department) {
    query = query.or(`department.eq.${department},department.is.null`);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function createTaskTemplate(template: {
  title: string;
  description?: string;
  estimated_hours?: number;
  department?: string;
  created_by: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('task_templates')
    .insert(template)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Task group operations
export async function getTaskGroups(department?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('task_groups')
    .select(`
      *,
      task_group_templates(
        order_index,
        task_template:task_templates(*)
      )
    `)
    .order('name');
    
  if (department) {
    query = query.or(`department.eq.${department},department.is.null`);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function createTaskGroup(group: {
  name: string;
  description?: string;
  department?: string;
  created_by: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('task_groups')
    .insert(group)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function assignTaskGroupToEmployee(
  taskGroupId: string,
  employeeId: string,
  assignedBy: string,
  dueDate?: string
) {
  const supabase = await createClient();
  
  // First, get all template IDs in the group
  const { data: groupTemplates, error: groupError } = await supabase
    .from('task_group_templates')
    .select('task_template_id')
    .eq('task_group_id', taskGroupId)
    .order('order_index');
    
  if (groupError) throw groupError;
  
  // Then get the actual templates
  const templateIds = groupTemplates.map(gt => gt.task_template_id);
  const { data: templates, error: templateError } = await supabase
    .from('task_templates')
    .select('*')
    .in('id', templateIds);
    
  if (templateError) throw templateError;
  
  // Create individual tasks for each template
  const tasksToCreate = templates.map(template => ({
    title: template.title,
    description: template.description,
    estimated_hours: template.estimated_hours,
    assigned_to: employeeId,
    assigned_by: assignedBy,
    task_template_id: template.id,
    task_group_id: taskGroupId,
    due_date: dueDate,
  }));
  
  const { data, error } = await supabase
    .from('tasks')
    .insert(tasksToCreate)
    .select();
    
  if (error) throw error;
  return data;
}

// Client-side query functions (for use in client components)
export async function getUserTasksClient(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      assigned_by_profile:profiles!tasks_assigned_by_fkey(*),
      task_template:task_templates(*)
    `)
    .eq('assigned_to', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function updateTaskStatusClient(
  taskId: string, 
  status: 'pending' | 'in_progress' | 'completed' | 'skipped',
  notes?: string
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .update({ status, notes })
    .eq('id', taskId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Client-side template operations
export async function getTaskTemplatesClient(department?: string) {
  const supabase = createClient();
  
  let query = supabase
    .from('task_templates')
    .select('*')
    .order('title');
    
  if (department) {
    query = query.or(`department.eq.${department},department.is.null`);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function createTaskTemplateClient(template: {
  title: string;
  description?: string;
  estimated_hours?: number;
  department?: string;
  created_by: string;
}) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('task_templates')
    .insert(template)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Assign task from template to employee
export async function assignTaskFromTemplateClient(
  templateId: string,
  assignedTo: string,
  assignedBy: string,
  dueDate?: string,
  taskGroupId?: string
) {
  const supabase = createClient();
  
  // First get the template
  const { data: template, error: templateError } = await supabase
    .from('task_templates')
    .select('*')
    .eq('id', templateId)
    .single();
    
  if (templateError) throw templateError;
  
  // Create task from template
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: template.title,
      description: template.description,
      estimated_hours: template.estimated_hours,
      assigned_to: assignedTo,
      assigned_by: assignedBy,
      task_template_id: templateId, 
      task_group_id: taskGroupId,
      // Store due_date as UTC string to avoid timezone shift
      due_date: dueDate ? new Date(dueDate + 'T00:00:00Z').toISOString().slice(0, 10) : undefined,
      status: 'pending'
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Create and assign custom task
export async function createAndAssignTaskClient(task: {
  title: string;
  description?: string;
  estimated_hours?: number;
  assigned_to: string;
  assigned_by: string;
  due_date?: string;
  task_group_id?: string;
}) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...task,
      status: 'pending'
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}
