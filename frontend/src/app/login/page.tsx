'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Shield, Lock, Mail } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('isLoggedIn', 'true');
      router.push('/dashboard');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 animate-page-entry">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-emerald-100 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 text-sm mt-1">Secure access to your medical dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            placeholder="doctor@neuramed.ai"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            icon={<Mail className="w-4 h-4 text-slate-400" />}
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            icon={<Lock className="w-4 h-4 text-slate-400" />}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-slate-600 cursor-pointer">
              <input type="checkbox" className="mr-2 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
              Remember me
            </label>
            <Link href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full py-2.5" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          Don't have an account?{' '}
          <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-semibold">
            Create Account
          </Link>
        </p>
      </Card>
      
      {/* Decorative background elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -z-10" />
    </div>
  );
}
