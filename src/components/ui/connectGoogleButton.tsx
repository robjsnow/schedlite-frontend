'use client';

import { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth';

export function ConnectGoogle() {
  const [connected, setConnected] = useState<boolean | null>(null);

  const fetchStatus = async () => {
    const res = await fetch('http://localhost:3001/api/integrations/google/status', {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    const data = await res.json();
    setConnected(data.connected);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnect = async () => {
    const res = await fetch('http://localhost:3001/api/integrations/google/auth', {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  const handleDisconnect = async () => {
    await fetch('http://localhost:3001/api/integrations/google/disconnect', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    setConnected(false); // update UI
  };

  if (connected === null) return <p>Loading…</p>;

  return connected ? (
    <div className="flex items-center gap-4">
      <p className="text-green-600">✅ Google Calendar Connected</p>
      <button
        onClick={handleDisconnect}
        className="px-3 py-1 text-sm bg-red-500 text-white rounded"
      >
        Disconnect
      </button>
    </div>
  ) : (
    <button onClick={handleConnect} className="px-4 py-2 bg-blue-600 text-white rounded">
      Connect Google Calendar
    </button>
  );
}
