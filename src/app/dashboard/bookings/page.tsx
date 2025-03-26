'use client'

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Booking {
  id: string;
  name: string;
  email: string;
  status: string;
  note?: string;
  createdAt: string;
  slot: {
    id: string;
    startTime: string;
    endTime: string;
  };
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      async function fetchBookings() {
        try {
          const res = await fetch("http://localhost:3001/api/book/mine", {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setBookings(data);
          }
        } catch (err) {
          console.error("Failed to fetch bookings", err);
        } finally {
          setLoading(false);
        }
      }
      fetchBookings();
    }, []);
  
    async function handleCancel(id: string) {
      if (!confirm("Are you sure you want to cancel this booking?")) return;
      try {
        const res = await fetch(`http://localhost:3001/api/book/${id}/cancel`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });
        if (res.ok) {
          setBookings((prev) =>
            prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
          );
        } else {
          console.error("Failed to cancel booking");
        }
      } catch (err) {
        console.error("Cancel error:", err);
      }
    }
  
    if (loading) return <p>Loading bookings...</p>;
  
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Your Bookings</h1>
        {bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <div className="space-y-2">
            {bookings.map((booking) => {
              const isFuture = new Date(booking.slot.endTime) > new Date();
              const canCancel = booking.status === "confirmed" && isFuture;
              return (
                <Card key={booking.id} className="p-4 space-y-2">
                  <p><strong>Client:</strong> {booking.name} ({booking.email})</p>
                  <p><strong>When:</strong> {new Date(booking.slot.startTime).toLocaleString()}</p>
                  {booking.note && <p><strong>Note:</strong> {booking.note}</p>}
                  <p><strong>Status:</strong> {booking.status}</p>
                  {canCancel && (
                    <Button variant="destructive" onClick={() => handleCancel(booking.id)}>
                      Cancel Booking
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }
  