# Supabase Setup for Onboarding Platform

## 🚀 Quick Setup

### 1. Database Schema
Run the SQL commands in `database-schema.sql` in your Supabase SQL editor to create all the necessary tables and relationships.

### 2. Environment Variables
Your `.env.local` file has been created with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://ribcayxeubylkmwsqnef.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Authentication Setup
In your Supabase dashboard:
1. Go to Authentication > Settings
2. Enable Email auth provider
3. Set Site URL to `http://localhost:3000` for development
4. Add any additional redirect URLs you need

## 📋 Database Schema Overview

### Core Tables:
- **profiles** - User profiles (extends auth.users)
- **task_templates** - Reusable task templates
- **task_groups** - Collections of task templates
- **tasks** - Individual assigned tasks
- **task_comments** - Comments on tasks

### Key Features:
- ✅ Row Level Security (RLS) enabled
- ✅ Automatic timestamps
- ✅ Role-based permissions (manager/employee)
- ✅ Task grouping for mass assignment
- ✅ Department-based filtering

## 🔧 Usage Examples

### Basic Auth Setup
```typescript
import { AuthProvider } from '@/hooks/use-auth';

// Wrap your app with AuthProvider
<AuthProvider>
  <YourApp />
</AuthProvider>
```

### Using Auth in Components
```typescript
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { user, profile, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;
  
  return <div>Welcome {profile?.full_name}!</div>;
}
```

### Database Operations
```typescript
import { getUserTasks, createTask } from '@/db/queries';

// Get user's tasks
const tasks = await getUserTasks(userId);

// Create a new task
const newTask = await createTask({
  title: "Complete orientation",
  description: "Attend the new employee orientation session",
  assigned_to: employeeId,
  assigned_by: managerId,
  due_date: "2025-07-01"
});
```

## 👥 User Roles

### Managers Can:
- Create task templates
- Create task groups
- Assign tasks to employees
- View all tasks they've assigned
- Update tasks they've created

### Employees Can:
- View tasks assigned to them
- Update status of their tasks
- Add comments to their tasks
- View their profile

## 🔒 Security Features

- All tables have Row Level Security enabled
- Users can only see and modify data they have permission for
- Managers can only manage tasks for their department/team
- Automatic user profile creation on signup

## 🚀 Next Steps

1. Run the database schema in Supabase
2. Set up authentication in your Supabase dashboard
3. Create your first manager account
4. Start building your frontend components!

## 📁 File Structure
```
src/
├── db/
│   ├── sbserver.ts     # Server-side Supabase client
│   ├── sbclient.ts     # Client-side Supabase client
│   └── queries.ts      # Database query functions
├── types/
│   └── database.ts     # TypeScript database types
└── hooks/
    └── use-auth.tsx    # Authentication hook
```
