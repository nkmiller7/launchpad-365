'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../db/sbclient';

export default function TestsPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState({
    id: 'demo-user-1',
    name: 'Demo User',
    role: 'manager' as 'manager' | 'employee',
    department: 'Engineering'
  });
  const supabase = createClient();

  // Form states
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    description: '',
    estimated_hours: '',
    department: ''
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load templates without auth restrictions
      const { data: templatesData, error: templatesError } = await supabase
        .from('task_templates')
        .select('*')
        .order('title');
      
      if (templatesError) {
        console.warn('Templates error (expected if tables not created):', templatesError);
        setTemplates([]);
      } else {
        setTemplates(templatesData || []);
      }
      
      // Load tasks without auth restrictions
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (tasksError) {
        console.warn('Tasks error (expected if tables not created):', tasksError);
        setTasks([]);
      } else {
        setTasks(tasksData || []);
      }
      
      setMessage('✅ Data loaded successfully! (No auth required)');
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('⚠️ Error loading data: ' + (error as Error).message + ' (Make sure to run the database schema first!)');
    }
    setLoading(false);
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: template, error } = await supabase
        .from('task_templates')
        .insert({
          title: newTemplate.title,
          description: newTemplate.description || undefined,
          estimated_hours: newTemplate.estimated_hours ? parseInt(newTemplate.estimated_hours) : undefined,
          department: newTemplate.department || undefined,
          created_by: currentUser.id
        })
        .select()
        .single();

      if (error) throw error;
      setTemplates([...templates, template]);
      setNewTemplate({ title: '', description: '', estimated_hours: '', department: '' });
      setMessage('✅ Task template created successfully!');
    } catch (error) {
      setMessage('❌ Error creating template: ' + (error as Error).message);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          title: newTask.title,
          description: newTask.description || undefined,
          assigned_to: newTask.assigned_to || currentUser.id,
          assigned_by: currentUser.id,
          due_date: newTask.due_date || undefined
        })
        .select()
        .single();

      if (error) throw error;
      setTasks([...tasks, task]);
      setNewTask({ title: '', description: '', assigned_to: '', due_date: '' });
      setMessage('✅ Task created successfully!');
    } catch (error) {
      setMessage('❌ Error creating task: ' + (error as Error).message);
    }
  };

  const toggleRole = () => {
    setCurrentUser({
      ...currentUser,
      role: currentUser.role === 'manager' ? 'employee' : 'manager'
    });
    setMessage(`✅ Switched to ${currentUser.role === 'manager' ? 'employee' : 'manager'} role`);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Supabase Connection Tests</h1>
          <p className="text-lg text-gray-600">Testing database connectivity without authentication</p>
        </div>
        
        {message && (
          <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-md shadow-sm">
            <p className="text-blue-800 font-medium">{message}</p>
          </div>
        )}

        {/* Demo User Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              👤
            </span>
            Demo User
          </h2>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-20">Name:</span>
                <span className="text-lg font-semibold text-gray-900">{currentUser.name}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-20">Role:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentUser.role === 'manager' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {currentUser.role}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-20">Dept:</span>
                <span className="text-gray-700">{currentUser.department}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-20">ID:</span>
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{currentUser.id}</span>
              </div>
            </div>
            <button 
              onClick={toggleRole}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Switch to {currentUser.role === 'manager' ? 'Employee' : 'Manager'}
            </button>
          </div>
        </div>

        {/* Task Templates Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              📋
            </span>
            Task Templates 
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
              {templates.length}
            </span>
          </h2>
          
          <form onSubmit={handleCreateTemplate} className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Template</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Complete onboarding paperwork"
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    placeholder="2"
                    value={newTemplate.estimated_hours}
                    onChange={(e) => setNewTemplate({...newTemplate, estimated_hours: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g., Engineering, HR, Marketing"
                  value={newTemplate.department}
                  onChange={(e) => setNewTemplate({...newTemplate, department: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Detailed instructions for this task..."
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  rows={3}
                />
              </div>
              <button 
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Create Template
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {templates.map((template) => (
              <div key={template.id} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.title}</h3>
                {template.description && (
                  <p className="text-gray-600 mb-3 leading-relaxed">{template.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {template.estimated_hours && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                      ⏱️ {template.estimated_hours} hours
                    </span>
                  )}
                  {template.department && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      🏢 {template.department}
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {templates.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="text-gray-400 text-4xl mb-2">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No templates yet</h3>
                <p className="text-gray-500 mb-4">Create your first task template above!</p>
                <p className="text-sm text-gray-400">
                  💡 If you get errors, make sure you've run the database schema in Supabase
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              ✅
            </span>
            Tasks 
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
              {tasks.length}
            </span>
          </h2>
          
          <form onSubmit={handleCreateTask} className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Set up development environment"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <input
                    type="text"
                    placeholder="User ID (leave empty for self)"
                    value={newTask.assigned_to}
                    onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Task details and instructions..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  rows={3}
                />
              </div>
              <button 
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Create Task
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status === 'in_progress' ? 'In Progress' : 
                     task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                </div>
                {task.description && (
                  <p className="text-gray-600 mb-3 leading-relaxed">{task.description}</p>
                )}
                <div className="flex flex-wrap gap-2 text-sm">
                  {task.due_date && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
                      📅 Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    👤 Assigned to: {task.assigned_to}
                  </span>
                </div>
              </div>
            ))}
            
            {tasks.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="text-gray-400 text-4xl mb-2">✅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks yet</h3>
                <p className="text-gray-500">Create your first task above!</p>
              </div>
            )}
          </div>
        </div>

        {/* Connection Test */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
              🔗
            </span>
            Connection Status
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Supabase URL</h3>
                <p className="text-sm font-mono text-gray-600 break-all">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Anon Key</h3>
                <p className="text-sm font-mono text-gray-600">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...
                </p>
              </div>
            </div>
            <button 
              onClick={loadData}
              className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              🔄 Test Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
