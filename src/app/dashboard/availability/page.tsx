'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getToken } from '@/lib/auth';

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Block = { start: string; end: string };
type Override = {
  date: string;
  status: "available" | "unavailable";
  start?: string;
  end?: string;
};

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState(
    weekdays.map((day, index) => {
      const enabled = index < 5;
      return {
        day,
        enabled,
        blocks: enabled ? [{ start: "09:00", end: "17:00" }] : [],
      };
    })
  );

  const [overrides, setOverrides] = useState<Override[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchOverrides() {
      try {
        const res = await fetch("http://localhost:3001/api/slots/overrides", {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const parsed = data.map((o: any) => ({
            date: o.date?.split('T')[0] ?? '',
            status: o.status,
            start: o.startTime || '',
            end: o.endTime || '',
          }));
          setOverrides(parsed);
        } else {
          console.warn("Override fetch failed", res.status);
        }
      } catch (err) {
        console.error("Failed to fetch overrides", err);
      }
    }

    fetchOverrides();
  }, []);

  function updateDayEnabled(index: number, enabled: boolean) {
    setAvailability(prev => {
      const copy = [...prev];
      copy[index].enabled = enabled;
      if (!enabled) copy[index].blocks = [];
      else if (copy[index].blocks.length === 0) {
        copy[index].blocks = [{ start: "09:00", end: "17:00" }];
      }
      return copy;
    });
  }

  function updateBlockTime(dayIdx: number, blockIdx: number, field: "start" | "end", value: string) {
    setAvailability(prev => {
      const copy = [...prev];
      copy[dayIdx].blocks[blockIdx][field] = value;
      return copy;
    });
  }

  function addBlock(dayIdx: number) {
    setAvailability(prev => {
      const copy = [...prev];
      copy[dayIdx].blocks.push({ start: "", end: "" });
      return copy;
    });
  }

  function removeBlock(dayIdx: number, blockIdx: number) {
    setAvailability(prev => {
      const copy = [...prev];
      copy[dayIdx].blocks.splice(blockIdx, 1);
      return copy;
    });
  }

  function addOverride() {
    setOverrides(prev => [
      ...prev,
      {
        date: "",
        status: "available",
        start: "",
        end: "",
      },
    ]);
  }

  function updateOverride(index: number, field: keyof Override, value: any) {
    setOverrides(prev => {
      const copy = [...prev];
      copy[index][field] = value;
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

    const enabledSchedule = availability.filter(d => d.enabled);
    const formattedOverrides = overrides.map(o => ({
      date: o.date,
      status: o.status,
      start: o.status === 'available' ? o.start : undefined,
      end: o.status === 'available' ? o.end : undefined,
    }));

    try {
      const token = getToken();

      // Save permanent rules
      const ruleRes = await fetch("http://localhost:3001/api/slots/rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ schedule: enabledSchedule }),
      });
      if (!ruleRes.ok) throw new Error("Failed to save rules.");

      // Save overrides + generate slots
      const bulkRes = await fetch("http://localhost:3001/api/slots/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ schedule: enabledSchedule, overrides: formattedOverrides }),
      });

      const bulkData = await bulkRes.json();
      if (!bulkRes.ok) throw new Error(bulkData.message || "Failed to update schedule.");

      setMessage("Schedule updated successfully!");
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Weekly Availability</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {availability.map((day, i) => (
          <div key={day.day} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-medium">{day.day}</label>
              <input
                type="checkbox"
                checked={day.enabled}
                onChange={(e) => updateDayEnabled(i, e.target.checked)}
              />
            </div>
            {day.enabled &&
              day.blocks.map((block, j) => (
                <div key={j} className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={block.start}
                    onChange={(e) => updateBlockTime(i, j, "start", e.target.value)}
                  />
                  <span>-</span>
                  <Input
                    type="time"
                    value={block.end}
                    onChange={(e) => updateBlockTime(i, j, "end", e.target.value)}
                  />
                  <Button type="button" variant="ghost" onClick={() => removeBlock(i, j)}>✕</Button>
                </div>
              ))}
            {day.enabled && (
              <Button type="button" variant="secondary" onClick={() => addBlock(i)}>
                + Add Time Block
              </Button>
            )}
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
              onChange={(e) => updateOverride(i, "status", e.target.value as "available" | "unavailable")}
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

            <Button variant="ghost" type="button" onClick={() => removeOverride(i)}>✕</Button>
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
