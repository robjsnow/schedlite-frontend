'use client';

import { useAuthGuard } from '@/lib/auth-check';
import { ReactNode } from 'react';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  useAuthGuard();
  return <>{children}</>;
}
