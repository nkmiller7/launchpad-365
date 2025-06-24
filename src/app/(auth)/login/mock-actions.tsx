'use server'

// Mock authentication for development when Supabase is not available
// This simulates Supabase auth behavior for local testing

interface MockUser {
    id: string;
    email: string;
    created_at: string;
}

interface MockAuthResponse {
    data: { user: MockUser | null; session: any | null };
    error: { message: string } | null;
}

// Simple in-memory storage for demo purposes
let mockUsers: MockUser[] = [
    // Pre-populated test accounts for easier testing
    {
        id: 'test-user-1',
        email: 'test@example.com',
        created_at: new Date().toISOString()
    },
    {
        id: 'test-user-2', 
        email: 'admin@test.com',
        created_at: new Date().toISOString()
    }
];
let currentSession: any = null;

export const loginUser = async (email: string, password: string): Promise<MockAuthResponse> => {
    console.log('Mock login attempt for:', email);
    console.log('Available mock users:', mockUsers.map(u => u.email));
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user exists
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
        console.log('User not found. Available emails:', mockUsers.map(u => u.email));
        return {
            data: { user: null, session: null },
            error: { message: `User with email ${email} not found. Try registering first or use test@example.com` }
        };
    }
    
    // For demo purposes, accept any password
    console.log('Login successful for:', email);
    const mockUser: MockUser = {
        id: user.id,
        email: user.email,
        created_at: user.created_at
    };
    
    currentSession = {
        access_token: 'mock-access-token',
        user: mockUser
    };
    
    return {
        data: { user: mockUser, session: currentSession },
        error: null
    };
}

export const signUp = async (email: string, password: string): Promise<MockAuthResponse> => {
    console.log('Mock signup attempt for:', email);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email);
    
    if (existingUser) {
        return {
            data: { user: null, session: null },
            error: { message: 'User already exists' }
        };
    }
    
    // Create new user
    const newUser: MockUser = {
        id: `mock-user-${Date.now()}`,
        email,
        created_at: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    console.log('Mock user created:', newUser);
    console.log('Total mock users:', mockUsers.length);
    
    return {
        data: { user: newUser, session: null },
        error: null
    };
}

export const signOut = async () => {
    console.log('Mock sign out');
    currentSession = null;
    // In a real app, you'd redirect here, but we'll handle that in the component
}
