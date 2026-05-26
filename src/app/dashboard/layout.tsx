"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

const navItems = [
  { href: "/dashboard", label: "Dashboard", emoji: "🏠", adminOnly: false },
  { href: "/dashboard/menu", label: "Menu", emoji: "🍽️", adminOnly: false },
  { href: "/dashboard/stock-opname", label: "Stock Opname", emoji: "📦", adminOnly: false },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f7f5f0" }}>
        <div className="text-center">
          <span className="text-5xl">☕</span>
          <p className="mt-4 text-sm" style={{ color: "#2d3a2d" }}>Memuat...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const isAdmin = (session.user as { role?: string })?.role === "ADMIN";

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f7f5f0" }}>
      {/* Sidebar */}
      <aside
        className="w-64 flex-shrink-0 flex flex-col min-h-screen"
        style={{ backgroundColor: "#1a2e1a" }}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Morning Mama Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
              Morning Mama
            </span>
          </div>
          <p className="text-xs mt-1 opacity-50 text-white">
            {isAdmin ? "Administrator" : "Staff"} Panel
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? "#2d6a4f" : "transparent",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
                  }}
                >
                  <span>{item.emoji}</span>
                  {item.label}
                </Link>
              );
            })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="px-4 py-3 mb-2">
            <p className="text-sm font-medium text-white truncate">{session.user?.name}</p>
            <p className="text-xs opacity-50 text-white truncate">{session.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all text-white/65 hover:text-white hover:bg-white/10"
          >
            <span>🚪</span>
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
