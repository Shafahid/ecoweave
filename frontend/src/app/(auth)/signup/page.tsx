'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2, Building2, User } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [role, setRole] = useState<'Factory' | 'Regulator' | 'Buyer/Brand' | 'Other'>('Factory');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signup(fullName, email, password, orgName || undefined);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4">
      <style jsx>{`
        .primary-btn {
          background: linear-gradient(135deg, #0f766e 0%, #22c55e 100%);
          position: relative;
          overflow: hidden;
        }
        .primary-btn::before {
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
        .primary-btn:hover::before {
          left: 100%;
        }
      `}</style>

      <div className="z-10 w-full max-w-6xl bg-white">
        <div className="bg-[f7f7f7] overflow-hidden rounded-[40px] shadow-2xl">
          <div className="grid min-h-[700px] lg:grid-cols-2">
            {/* Left Side */}
            <div className="brand-side relative m-4 flex flex-col justify-end rounded-3xl bg-[url('/authbg.png')] bg-cover p-12 text-white">
              {/* Overlay */}
              <div className="absolute inset-0 rounded-3xl bg-[#004737]/70"></div>

              <div className="relative z-10 space-y-6">
                <Image src="/logo/logo4.png" alt="EcoWeave Logo" width={60} height={60} />

                <h1 className="text-6xl font-medium leading-[1.05]">
                  Start Preventing High-Risk Discharge Moments
                </h1>

                <p className="text-xl opacity-80">
                  Create your EcoWeave account to upload shift data, detect anomalies,
                  and generate audit-ready compliance reports.
                </p>

                <div className="mt-6 flex flex-wrap gap-2 text-sm opacity-90">
                  <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
                    Risk scoring
                  </span>
                  <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
                    Triangulation
                  </span>
                  <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
                    Alerts & reports
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex flex-col justify-center p-12">
              <div className="mx-auto w-full max-w-md">
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-medium uppercase tracking-tight">
                    Create account
                  </h2>
                  <p className="mt-2 text-sm text-stone-600">
                    Set up your workspace to access the EcoWeave dashboard.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label className="mb-2 block text-sm font-medium uppercase">
                      Full name
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="border-border bg-input block w-full rounded-lg border py-3 pr-3 pl-10 text-sm"
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  {/* Organization */}
                  <div>
                    <label className="mb-2 block text-sm font-medium uppercase">
                      Organization
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        required
                        className="border-border bg-input block w-full rounded-lg border py-3 pr-3 pl-10 text-sm"
                        placeholder="Factory / Agency / Brand"
                      />
                    </div>
                  </div>

                 
                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-medium uppercase">
                      Email
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-border bg-input block w-full rounded-lg border py-3 pr-3 pl-10 text-sm"
                        placeholder="you@organization.com"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-2 block text-sm font-medium uppercase">
                      Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-border bg-input block w-full rounded-lg border py-3 pr-12 pl-10 text-sm"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                    <p className="mt-1 text-xs text-stone-500">
                      Use at least 8 characters.
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="mb-2 block text-sm font-medium uppercase">
                      Confirm password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="border-border bg-input block w-full rounded-lg border py-3 pr-12 pl-10 text-sm"
                        placeholder="Re-enter password"
                      />
                      <button
                        type="button"
                        aria-label={
                          showConfirmPassword ? 'Hide password' : 'Show password'
                        }
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    className="primary-btn relative flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-white transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="ml-2">Creating account...</span>
                      </>
                    ) : (
                      'Create EcoWeave account'
                    )}
                  </button>

                  <p className="text-center text-xs text-stone-500">
                    By creating an account, you agree to our Terms and Privacy Policy.
                  </p>
                </form>

                <div className="text-muted-foreground mt-8 text-center text-sm">
                  Already have an account?{' '}
                  <a href="/signin" className="text-primary font-bold hover:text-primary/80">
                    Sign in
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
