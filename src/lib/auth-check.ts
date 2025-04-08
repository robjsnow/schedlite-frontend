// lib/auth-check.ts
'use client';

import { getToken, clearToken } from './auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('http://localhost:3001/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        clearToken();
        router.push('/login');
      }
    };

    check();
  }, [router]);
}
