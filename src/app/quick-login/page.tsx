'use client';

import { useState } from 'react';
import { createClient } from '../../db/sbclient';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export default function QuickLogin() {
  const [result, setResult] = useState<string>('');
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const testLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setResult(`❌ Login failed: ${error.message}`);
      } else {
        setResult(`✅ Login successful! User: ${data.user?.email}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const quickRegisterAndLogin = async () => {
    setLoading(true);
    try {
      // First try to register
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError && !signUpError.message.includes('already registered')) {
        setResult(`❌ Registration failed: ${signUpError.message}`);
        setLoading(false);
        return;
      }

      // Then try to login
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        setResult(`❌ Login after registration failed: ${signInError.message}`);
      } else {
        setResult(`✅ Quick register + login successful! User: ${data.user?.email}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quick Login Test</h1>
      <p className="mb-4 text-gray-600">
        Test login functionality - will auto-create account if needed
      </p>
      
      <div className="space-y-4 mb-6">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@example.com"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password123"
          />
        </div>
      </div>

      <div className="space-x-4 mb-6">
        <Button onClick={testLogin} disabled={loading}>
          {loading ? 'Testing...' : 'Test Login Only'}
        </Button>
        <Button onClick={quickRegisterAndLogin} disabled={loading} variant="outline">
          {loading ? 'Processing...' : 'Auto Register + Login'}
        </Button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Result:</h2>
        <pre className="whitespace-pre-wrap text-sm">{result}</pre>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Quick Test Accounts:</h3>
        <p>Try these common test credentials:</p>
        <ul className="list-disc list-inside mt-2">
          <li>test@example.com / password123</li>
          <li>admin@test.com / admin123</li>
          <li>user@demo.com / demo123</li>
        </ul>
      </div>
    </div>
  );
}
