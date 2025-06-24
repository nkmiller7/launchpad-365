'use client';

import { useState } from 'react';
import { createClient } from '../../db/sbclient';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export default function ConnectionTest() {
  const [result, setResult] = useState<string>('');
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const supabase = createClient();

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      setResult(`Connection successful! Session: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Connection failed: ${error}`);
    }
  };

  const testSignUp = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        setResult(`Signup error: ${error.message}`);
      } else {
        setResult(`Signup successful! User: ${JSON.stringify(data.user, null, 2)}`);
      }
    } catch (error) {
      setResult(`Signup failed: ${error}`);
    }
  };

  const testSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setResult(`Login error: ${error.message}`);
      } else {
        setResult(`Login successful! User: ${JSON.stringify(data.user, null, 2)}`);
      }
    } catch (error) {
      setResult(`Login failed: ${error}`);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="space-y-4 mb-6">
        <div>
          <Label htmlFor="email">Test Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@example.com"
          />
        </div>
        <div>
          <Label htmlFor="password">Test Password</Label>
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
        <Button onClick={testConnection}>Test Connection</Button>
        <Button onClick={testSignUp}>Test Sign Up</Button>
        <Button onClick={testSignIn}>Test Sign In</Button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Result:</h2>
        <pre className="whitespace-pre-wrap text-sm">{result}</pre>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Environment Check:</h3>
        <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
        <p><strong>Supabase Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
      </div>
    </div>
  );
}
