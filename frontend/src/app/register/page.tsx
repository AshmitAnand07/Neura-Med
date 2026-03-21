'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Shield, User, Mail, Lock, Phone } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
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
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1">Join the NeuraMed healthcare platform</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Dr. John Doe"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            icon={<User className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="john@hospital.com"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            icon={<Mail className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            icon={<Phone className="w-4 h-4 text-slate-400" />}
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

          <div className="text-xs text-slate-500 px-1 pt-2">
            By signing up, you agree to our{' '}
            <Link href="#" className="text-emerald-600 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="#" className="text-emerald-600 hover:underline">Privacy Policy</Link>.
          </div>

          <Button type="submit" className="w-full py-2.5 mt-2" isLoading={isLoading}>
            Create My Account
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
            Sign In
          </Link>
        </p>
      </Card>
      
      {/* Decorative background elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl -z-10" />
    </div>
  );
}
