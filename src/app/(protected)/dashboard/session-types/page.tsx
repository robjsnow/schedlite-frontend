'use client'

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getToken } from '@/lib/auth';

interface SessionType {
  id: string;
  name: string;
  duration: number;
  price?: number;
}

export default function SessionTypesPage() {
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [price, setPrice] = useState<number | undefined>();
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchSessionTypes() {
      const res = await fetch('http://localhost:3001/api/session-types', {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await res.json();
      if (res.ok) setSessionTypes(data);
    }
    fetchSessionTypes();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('http://localhost:3001/api/session-types', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ name, duration, price }),
    });
    const data = await res.json();
    if (res.ok) {
      setSessionTypes(prev => [...prev, data]);
      setName('');
      setDuration(30);
      setPrice(undefined);
      setMessage('Session type created successfully!');
    } else {
      setMessage(data.message || 'Failed to create session type.');
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`http://localhost:3001/api/session-types/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    const data = await res.json();
    if (res.ok) {
      setSessionTypes(prev => prev.filter(s => s.id !== id));
      setMessage('Session type deleted successfully.');
    } else {
      setMessage(data.message || 'Failed to delete session type.');
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Manage Session Types</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Session name (e.g. 30 Minute Coaching)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          type="number"
          placeholder="Duration in minutes"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          required
        />
        <Input
          type="number"
          placeholder="Price in USD (e.g. 3.00)"
          value={price !== undefined ? (price / 100).toFixed(2) : ''}
          onChange={(e) => setPrice(Math.round(Number(e.target.value) * 100) || undefined)}
        />
        <Button type="submit">Create Session Type</Button>
        {message && <p className="text-sm text-center mt-2 text-red-600">{message}</p>}
      </form>

      <div>
        <h2 className="text-lg font-medium mt-6">Your Session Types</h2>
        <ul className="space-y-2">
          {sessionTypes.map((s) => (
            <li key={s.id} className="flex justify-between items-center border p-2 rounded">
              <span>
                {s.name} – {s.duration} min {s.price ? `– $${(s.price / 100).toFixed(2)}` : ''}
              </span>
              <Button variant="destructive" onClick={() => handleDelete(s.id)}>Delete</Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
