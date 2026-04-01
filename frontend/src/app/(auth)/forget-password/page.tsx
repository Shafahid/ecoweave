'use client';

import { useState } from 'react';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
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

      <div className="z-10 w-full max-w-4xl bg-white">
        <div className="bg-[f7f7f7] overflow-hidden rounded-[40px] shadow-2xl">
          <div className="grid min-h-[520px] lg:grid-cols-2">
            {/* Left Side */}
            <div className="relative m-4 flex flex-col justify-end rounded-3xl bg-[url('/authbg.png')] bg-cover p-12 text-white">
              <div className="absolute inset-0 rounded-3xl bg-[#004737]/70"></div>

              <div className="relative z-10 space-y-6">
                <Image
                  src="/logo/logo4.png"
                  alt="EcoWeave Logo"
                  width={60}
                  height={60}
                />

                <h1 className="text-5xl font-medium leading-[1.05]">
                  Reset access securely
                </h1>

                <p className="text-lg opacity-80">
                  We’ll send a reset link to your email. For demo purposes, this
                  page shows the flow without real email delivery.
                </p>

                <div className="text-sm opacity-80">
                  Tip: Use your work email (e.g., you@factory.com)
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex flex-col justify-center p-12">
              <div className="mx-auto w-full max-w-md">
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-medium uppercase tracking-tight">
                    Forgot password
                  </h2>
                  <p className="mt-2 text-sm text-stone-600">
                    Enter your email and we’ll send a reset link.
                  </p>
                </div>

                {!sent ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
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

                    <button
                      type="submit"
                      className="primary-btn relative flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-white transition-all duration-300"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span className="ml-2">Sending link...</span>
                        </>
                      ) : (
                        'Send reset link'
                      )}
                    </button>

                    <a
                      href="/signin"
                      className="inline-flex items-center justify-center text-sm text-stone-600 hover:text-stone-900"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to sign in
                    </a>

                    <p className="text-center text-xs text-stone-500">
                      Demo UI only — password reset will be connected later.
                    </p>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
                      <div className="text-sm font-semibold">
                        Reset link sent (demo)
                      </div>
                      <div className="mt-1 text-sm opacity-90">
                        If an account exists for <span className="font-medium">{email}</span>,
                        you’ll receive an email with instructions.
                      </div>
                    </div>

                    <button
                      type="button"
                      className="primary-btn relative flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-white transition-all duration-300"
                      onClick={() => {
                        setSent(false);
                        setEmail('');
                      }}
                    >
                      Send another link
                    </button>

                    <a
                      href="/signin"
                      className="inline-flex items-center justify-center text-sm text-stone-600 hover:text-stone-900"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to sign in
                    </a>

                   
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
