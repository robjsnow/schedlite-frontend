'use client'
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getToken } from '@/lib/auth';


const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState(
    weekdays.map((day, index) => {
      if (index < 5) {
        return { day, start: "09:00", end: "17:00", enabled: true }; // Mon–Fri
      } else {
        return { day, start: "", end: "", enabled: false }; // Sat–Sun
      }
    })
  );
  const [overrides, setOverrides] = useState<{
    date: string;
    status: "available" | "unavailable";
    start?: string;
    end?: string;
  }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function updateDay(index: number, field: "start" | "end" | "enabled", value: any) {
    setAvailability(prev => {
      const copy = [...prev];
      (copy[index] as any)[field] = value;
      return copy;
    });
  }

  function addOverride() {
    setOverrides(prev => [...prev, { date: "", status: "unavailable" }]);
  }

  function updateOverride(index: number, field: string, value: string) {
    setOverrides(prev => {
      const copy = [...prev];
      (copy[index] as any)[field] = value;
      return copy;
    });
  }

  function removeOverride(index: number) {
    setOverrides(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const selected = availability.filter(day => day.enabled);
    const res = await fetch("http://localhost:3001/api/slots/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ schedule: selected, overrides }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Schedule updated successfully!");
    } else {
      setMessage(data.message || "Failed to update schedule.");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Weekly Availability</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {availability.map((day, i) => (
          <div key={day.day} className="flex items-center gap-4">
            <label className="w-24 font-medium">{day.day}</label>
            <Input
              type="time"
              value={day.start}
              onChange={(e) => updateDay(i, "start", e.target.value)}
              disabled={!day.enabled}
            />
            <span>-</span>
            <Input
              type="time"
              value={day.end}
              onChange={(e) => updateDay(i, "end", e.target.value)}
              disabled={!day.enabled}
            />
            <input
              type="checkbox"
              checked={day.enabled}
              onChange={(e) => updateDay(i, "enabled", e.target.checked)}
            />
          </div>
        ))}

        <h2 className="text-lg font-medium pt-4">Overrides</h2>
        {overrides.map((override, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              value={override.date}
              onChange={(e) => updateOverride(i, "date", e.target.value)}
              required
            />
            <select
              value={override.status}
              onChange={(e) => updateOverride(i, "status", e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
            {override.status === "available" && (
              <>
                <Input
                  type="time"
                  value={override.start || ""}
                  onChange={(e) => updateOverride(i, "start", e.target.value)}
                />
                <Input
                  type="time"
                  value={override.end || ""}
                  onChange={(e) => updateOverride(i, "end", e.target.value)}
                />
              </>
            )}
            <Button variant="ghost" type="button" onClick={() => removeOverride(i)}>
              ✕
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={addOverride}>
          Add Override
        </Button>

        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Save Schedule"}
        </Button>
      </form>
      {message && <p className="text-sm text-center mt-2">{message}</p>}
    </div>
  );
}
