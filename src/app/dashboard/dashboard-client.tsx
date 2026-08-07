"use client";

import { useState, useEffect } from "react";

type DashboardStats = {
  menuCount: number;
  categoryCount: number;
  stockCount: number;
  lowStockItems: any[];
  recentOpname: any[];
};

export default function DashboardClient({
  isAdmin,
  session,
}: {
  isAdmin: boolean;
  session: any;
}) {
  const [stats, setStats] = useState<DashboardStats>({
    menuCount: 0,
    categoryCount: 0,
    stockCount: 0,
    lowStockItems: [],
    recentOpname: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchDashboardData() {
    try {
      const response = await fetch("/api/dashboard-stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  const statsDisplay = [
    { label: "Total Menu", value: stats.menuCount, emoji: "🍽️", color: "#8b4513" },
    { label: "Kategori", value: stats.categoryCount, emoji: "📂", color: "#c4763a" },
    { label: "Item Stok", value: stats.stockCount, emoji: "📦", color: "#2c6b4a" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: "#9a7a6a" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#2c1810", fontFamily: "Georgia, serif" }}>
          Selamat Datang, {session?.user?.name} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: "#5a3a2a" }}>
          {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statsDisplay.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{s.emoji}</span>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: s.color }}
              >
                Total
              </span>
            </div>
            <p className="text-4xl font-bold mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-sm" style={{ color: "#5a3a2a" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Opname */}
        {isAdmin && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold mb-4" style={{ color: "#2c1810" }}>Opname Terbaru</h2>
            {stats.recentOpname.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#9a7a6a" }}>
                Belum ada data opname
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentOpname.map((op: any) => (
                  <div key={op.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "#f0e8e0" }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#2c1810" }}>
                        {new Date(op.date).toLocaleDateString("id-ID")}
                      </p>
                      <p className="text-xs" style={{ color: "#9a7a6a" }}>{op.opnameItems?.length || 0} item</p>
                    </div>
                    {op.notes && (
                      <p className="text-xs max-w-32 truncate" style={{ color: "#5a3a2a" }}>{op.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold mb-4" style={{ color: "#2c1810" }}>Aksi Cepat</h2>
          <div className="space-y-3">
            <a
              href="/dashboard/menu"
              className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:opacity-80"
              style={{ backgroundColor: "#fdf1e0" }}
            >
              <span className="text-xl">🍽️</span>
              <div>
                <p className="text-sm font-medium" style={{ color: "#2c1810" }}>Kelola Menu</p>
                <p className="text-xs" style={{ color: "#9a7a6a" }}>Tambah atau edit item menu</p>
              </div>
            </a>
            {isAdmin && (
              <a
                href="/dashboard/stock-opname"
                className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:opacity-80"
                style={{ backgroundColor: "#fdf1e0" }}
              >
                <span className="text-xl">📦</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#2c1810" }}>Stock Opname</p>
                  <p className="text-xs" style={{ color: "#9a7a6a" }}>Catat pengecekan stok</p>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
