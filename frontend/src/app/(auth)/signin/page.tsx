'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  FileSpreadsheet,
  AlertTriangle,
  ShieldCheck,
  BarChart3,
  Github,
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4">
      <style jsx>{`
        .login-btn {
          background: linear-gradient(135deg, #0f766e 0%, #22c55e 100%);
          position: relative;
          overflow: hidden;
        }
        .login-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.28),
            transparent
          );
          transition: left 0.5s;
        }
        .login-btn:hover::before {
          left: 100%;
        }
      `}</style>

      <div className="z-10 w-full max-w-6xl bg-white">
        <div className="bg-[f7f7f7] overflow-hidden rounded-[40px] shadow-2xl">
          <div className="grid min-h-[700px] lg:grid-cols-2">
            {/* Left Side */}
            <div className="brand-side relative m-4 rounded-3xl bg-[url('/authbg.png')] bg-cover p-12 text-white flex flex-col justify-end">
              {/* Black Overlay */}
              <div className="absolute inset-0 bg-[#004737]/70 rounded-3xl"></div>
              <div className="relative z-10 space-y-6">
                <Image src="/logo/logo4.png" alt="EcoWeave Logo" width={60} height={60} />

                <h1 className="mb-4 text-6xl font-medium">
                  Make Pollution Financially Irrational
                </h1>

                <p className="mb-12 text-xl opacity-80">
                  Predict high-risk discharge moments, verify data with forensic
                  triangulation, and send money-first alerts factories actually
                  act on.
                </p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex flex-col justify-center p-12">
              <div className="mx-auto w-full max-w-md">
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-medium uppercase tracking-tight">
                    Welcome back!
                  </h2>
                  <p className="mt-2 text-sm text-stone-600">
                    Sign in to access your compliance dashboard, alerts, and
                    reports.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium uppercase"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-border bg-input block w-full rounded-lg border py-3 pr-3 pl-10 text-sm"
                        placeholder="you@factory.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium uppercase"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-border bg-input block w-full rounded-lg border py-3 pr-12 pl-10 text-sm"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <label className="text-muted-foreground flex items-center text-sm">
                      <input
                        type="checkbox"
                        className="border-border text-primary h-4 w-4 rounded"
                      />
                      <span className="ml-2">Keep me signed in</span>
                    </label>
                    <a
                      href="#"
                      className="text-primary hover:text-primary/80 text-sm"
                    >
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="login-btn relative flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-white transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="ml-2">Signing in...</span>
                      </>
                    ) : (
                      'Sign in to EcoWeave'
                    )}
                  </button>

                  

                  
                </form>

                <div className="text-muted-foreground mt-8 text-center text-sm">
                  Don't have an account?{' '}
                  <a href="/signup" className="text-primary hover:text-primary/80 font-bold">
                    Sign up
                  </a>
                </div>
                <div className="text-muted-foreground mt-2 text-center text-sm">
                  
                  <a href="/forget-password" className="text-primary hover:text-primary/80 font-bold">
                    Forgot password? 
                  </a>

                </div>
                <div className="text-muted-foreground mt-2 text-center text-sm">
                  <a href="/" className="text-primary hover:text-primary/80 font-medium underline">
                    Back to home 
                  </a>
                </div>

               
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
