import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4 border-r">
        <nav className="space-y-2">
          <Link href="/dashboard" className="block">Dashboard</Link>
          <Link href="/dashboard/bookings" className="block">Bookings</Link>
          <Link href="/dashboard/availability" className="block">Availability</Link>
          <Link href="/dashboard/integrations" className="block">Integrations</Link>
          <Link href="/dashboard/settings" className="block">Settings</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
