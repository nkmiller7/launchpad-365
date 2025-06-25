export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'manager' | 'employee' | 'individual contributor' | 'hr';
          department: string | null;
          hire_date: string | null;
          manager_id: string | null;
          created_at: string;
          updated_at: string;
        };        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'manager' | 'employee' | 'individual contributor' | 'hr';
          department?: string | null;
          hire_date?: string | null;
          manager_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'manager' | 'employee' | 'individual contributor' | 'hr';
          department?: string | null;
          hire_date?: string | null;
          manager_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      task_templates: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          estimated_hours: number | null;
          department: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          estimated_hours?: number | null;
          department?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          estimated_hours?: number | null;
          department?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      task_groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          department: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          department?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          department?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      task_group_templates: {
        Row: {
          id: string;
          task_group_id: string;
          task_template_id: string;
          order_index: number;
        };
        Insert: {
          id?: string;
          task_group_id: string;
          task_template_id: string;
          order_index?: number;
        };
        Update: {
          id?: string;
          task_group_id?: string;
          task_template_id?: string;
          order_index?: number;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          estimated_hours: number | null;
          assigned_to: string;
          assigned_by: string;
          task_template_id: string | null;
          task_group_id: string | null;
          status: 'pending' | 'in_progress' | 'completed' | 'skipped';
          due_date: string | null;
          completed_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          estimated_hours?: number | null;
          assigned_to: string;
          assigned_by: string;
          task_template_id?: string | null;
          task_group_id?: string | null;
          status?: 'pending' | 'in_progress' | 'completed' | 'skipped';
          due_date?: string | null;
          completed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          estimated_hours?: number | null;
          assigned_to?: string;
          assigned_by?: string;
          task_template_id?: string | null;
          task_group_id?: string | null;
          status?: 'pending' | 'in_progress' | 'completed' | 'skipped';
          due_date?: string | null;
          completed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      task_comments: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          comment: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          comment: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          comment?: string;
          created_at?: string;
        };
      };
    };
  };
}
