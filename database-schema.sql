-- Onboarding Platform Database Schema

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('manager', 'employee', 'individual contributor', 'hr')) NOT NULL DEFAULT 'employee',
    department TEXT,
    hire_date DATE,
    manager_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task templates (pre-set tasks that can be reused)
CREATE TABLE public.task_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    estimated_hours INTEGER,
    department TEXT,
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task groups/collections (for mass assignment)
CREATE TABLE public.task_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    department TEXT,
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for task templates in groups
CREATE TABLE public.task_group_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_group_id UUID REFERENCES public.task_groups(id) ON DELETE CASCADE,
    task_template_id UUID REFERENCES public.task_templates(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    UNIQUE(task_group_id, task_template_id)
);

-- Individual tasks assigned to employees
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    estimated_hours INTEGER,
    assigned_to UUID REFERENCES public.profiles(id) NOT NULL,
    assigned_by UUID REFERENCES public.profiles(id) NOT NULL,
    task_template_id UUID REFERENCES public.task_templates(id),
    task_group_id UUID REFERENCES public.task_groups(id),
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')) DEFAULT 'pending',
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task comments/updates
CREATE TABLE public.task_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_group_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Task Templates: Anyone can read, only managers can create/update
CREATE POLICY "Task templates are viewable by everyone" ON public.task_templates
    FOR SELECT USING (true);

CREATE POLICY "Managers can create task templates" ON public.task_templates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

CREATE POLICY "Creators can update their task templates" ON public.task_templates
    FOR UPDATE USING (created_by = auth.uid());

-- Task Groups: Anyone can read, only managers can create/update
CREATE POLICY "Task groups are viewable by everyone" ON public.task_groups
    FOR SELECT USING (true);

CREATE POLICY "Managers can create task groups" ON public.task_groups
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

CREATE POLICY "Creators can update their task groups" ON public.task_groups
    FOR UPDATE USING (created_by = auth.uid());

-- Task Group Templates: Inherit permissions from task groups
CREATE POLICY "Task group templates are viewable by everyone" ON public.task_group_templates
    FOR SELECT USING (true);

CREATE POLICY "Managers can manage task group templates" ON public.task_group_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.task_groups tg
            JOIN public.profiles p ON p.id = auth.uid()
            WHERE tg.id = task_group_id AND (tg.created_by = auth.uid() OR p.role = 'manager')
        )
    );

-- Tasks: Users can see their own tasks and tasks they assigned
CREATE POLICY "Users can view relevant tasks" ON public.tasks
    FOR SELECT USING (
        assigned_to = auth.uid() OR 
        assigned_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

CREATE POLICY "Managers can create tasks" ON public.tasks
    FOR INSERT WITH CHECK (
        assigned_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

CREATE POLICY "Task assignees can update task status" ON public.tasks
    FOR UPDATE USING (assigned_to = auth.uid())
    WITH CHECK (assigned_to = auth.uid());

CREATE POLICY "Task assigners can update tasks they created" ON public.tasks
    FOR UPDATE USING (assigned_by = auth.uid());

-- Task Comments: Users can read comments on their tasks and add comments
CREATE POLICY "Users can view comments on relevant tasks" ON public.task_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = task_id AND (t.assigned_to = auth.uid() OR t.assigned_by = auth.uid())
        )
    );

CREATE POLICY "Users can comment on relevant tasks" ON public.task_comments
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = task_id AND (t.assigned_to = auth.uid() OR t.assigned_by = auth.uid())
        )
    );

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_task_templates_updated_at
    BEFORE UPDATE ON public.task_templates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_task_groups_updated_at
    BEFORE UPDATE ON public.task_groups
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically complete tasks
CREATE OR REPLACE FUNCTION public.handle_task_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = NOW();
    ELSIF NEW.status != 'completed' THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_task_completion_trigger
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_task_completion();
