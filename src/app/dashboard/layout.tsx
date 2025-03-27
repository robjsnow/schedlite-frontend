'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken, clearToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  if (!authChecked) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between p-4 border-b shadow-sm">
        <h1 className="text-lg font-semibold">SchedLite Dashboard</h1>
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SidebarNav />
            </SheetContent>
          </Sheet>
          <Button variant="destructive" onClick={handleLogout}>Logout</Button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:block w-64 border-r p-4 bg-gray-50">
          <SidebarNav />
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

function SidebarNav() {
  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/bookings", label: "Bookings" },
    { href: "/dashboard/availability", label: "Availability" },
    { href: "/dashboard/session-types", label: "Session Types" },
    { href: "/dashboard/integrations", label: "Integrations" },
    { href: "/dashboard/settings", label: "Settings" },
    
  ];

  return (
    <nav className="space-y-2">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}