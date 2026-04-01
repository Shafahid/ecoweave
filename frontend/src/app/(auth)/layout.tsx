'use client';

import { AuthProvider } from '@/lib/auth-context';
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
