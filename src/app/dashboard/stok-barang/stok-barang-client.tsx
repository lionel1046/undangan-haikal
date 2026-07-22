"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type StockRecord = {
  id: string;
  itemName: string;
  initialStock: number;
  incoming: number;
  outgoing: number;
  finalStock: number;
  difference: number;
  date: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Stats = {
  totalItems: number;
  totalOutToday: number;
  lowStockCount: number;
  totalStockAvailable: number;
};

export default function StokBarangClient({
  initialRecords,
  stats,
  isAdmin,
}: {
  initialRecords: StockRecord[];
  stats: Stats;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [records, setRecords] = useState<StockRecord[]>(initialRecords);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [formData, setFormData] = useState({
    itemName: "",
    initialStock: "",
    incoming: "",
    outgoing: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  function getStockStatus(finalStock: number): { label: string; color: string } {
    if (finalStock < 10) return { label: "Perlu Refill", color: "#ef4444" };
    if (finalStock <= 20) return { label: "Menipis", color: "#f59e0b" };
    return { label: "Aman", color: "#22c55e" };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const initialStock = parseFloat(formData.initialStock) || 0;
    const incoming = parseFloat(formData.incoming) || 0;
    const outgoing = parseFloat(formData.outgoing) || 0;
    const finalStock = initialStock + incoming - outgoing;
    const difference = finalStock - initialStock;

    const payload = {
      itemName: formData.itemName,
      initialStock,
      incoming,
      outgoing,
      finalStock,
      difference,
      date: new Date(formData.date).toISOString(),
      notes: formData.notes || null,
    };

    try {
      if (editingId) {
        await fetch(`/api/stock-records/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/stock-records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      router.refresh();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        itemName: "",
        initialStock: "",
        incoming: "",
        outgoing: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
    } catch (error) {
      console.error("Error saving record:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus data ini?")) return;

    try {
      await fetch(`/api/stock-records/${id}`, { method: "DELETE" });
      router.refresh();
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  }

  function handleEdit(record: StockRecord) {
    setEditingId(record.id);
    setFormData({
      itemName: record.itemName,
      initialStock: String(record.initialStock),
      incoming: String(record.incoming),
      outgoing: String(record.outgoing),
      date: new Date(record.date).toISOString().split("T")[0],
      notes: record.notes || "",
    });
    setShowForm(true);
  }

  function exportToCSV() {
    const headers = [
      "Tanggal",
      "Nama Barang",
      "Stok Awal",
      "Stok Masuk",
      "Stok Keluar",
      "Stok Akhir",
      "Selisih",
      "Status",
      "Catatan",
    ];

    const rows = filteredRecords.map((r) => {
      const status = getStockStatus(r.finalStock).label;
      return [
        new Date(r.date).toLocaleDateString("id-ID"),
        r.itemName,
        r.initialStock,
        r.incoming,
        r.outgoing,
        r.finalStock,
        r.difference,
        status,
        r.notes || "",
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `stok-barang-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }

  const filteredRecords = records.filter((r) => {
    const matchesSearch = r.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter
      ? new Date(r.date).toISOString().split("T")[0] === dateFilter
      : true;
    return matchesSearch && matchesDate;
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#2c1810", fontFamily: "Georgia, serif" }}>
            Stok Barang
          </h1>
          <p className="text-sm mt-1" style={{ color: "#5a3a2a" }}>
            Kelola dan pantau stok barang harian
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              itemName: "",
              initialStock: "",
              incoming: "",
              outgoing: "",
              date: new Date().toISOString().split("T")[0],
              notes: "",
            });
            setShowForm(true);
          }}
          className="px-4 py-2 rounded-lg text-white font-medium text-sm"
          style={{ backgroundColor: "#2d6a4f" }}
        >
          + Tambah Data
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📦</span>
            <span className="text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ backgroundColor: "#8b4513" }}>
              Total
            </span>
          </div>
          <p className="text-3xl font-bold" style={{ color: "#8b4513" }}>{stats.totalItems}</p>
          <p className="text-sm" style={{ color: "#5a3a2a" }}>Total Barang</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📤</span>
            <span className="text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ backgroundColor: "#c4763a" }}>
              Hari Ini
            </span>
          </div>
          <p className="text-3xl font-bold" style={{ color: "#c4763a" }}>{stats.totalOutToday}</p>
          <p className="text-sm" style={{ color: "#5a3a2a" }}>Stok Keluar</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⚠️</span>
            <span className="text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ backgroundColor: "#ef4444" }}>
              Kritis
            </span>
          </div>
          <p className="text-3xl font-bold" style={{ color: "#ef4444" }}>{stats.lowStockCount}</p>
          <p className="text-sm" style={{ color: "#5a3a2a" }}>Perlu Refill</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">✅</span>
            <span className="text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ backgroundColor: "#22c55e" }}>
              Tersedia
            </span>
          </div>
          <p className="text-3xl font-bold" style={{ color: "#22c55e" }}>{stats.totalStockAvailable}</p>
          <p className="text-sm" style={{ color: "#5a3a2a" }}>Total Stok</p>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: "#2c1810", fontFamily: "Georgia, serif" }}>
                {editingId ? "Edit Data Stok" : "Tambah Data Stok"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#2c1810" }}>
                  Nama Barang
                </label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#d4a853" }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#2c1810" }}>
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    value={formData.initialStock}
                    onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                    required
                    min="0"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: "#d4a853" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#2c1810" }}>
                    Masuk
                  </label>
                  <input
                    type="number"
                    value={formData.incoming}
                    onChange={(e) => setFormData({ ...formData, incoming: e.target.value })}
                    min="0"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: "#d4a853" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#2c1810" }}>
                    Keluar
                  </label>
                  <input
                    type="number"
                    value={formData.outgoing}
                    onChange={(e) => setFormData({ ...formData, outgoing: e.target.value })}
                    min="0"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: "#d4a853" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#2c1810" }}>
                  Tanggal
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#d4a853" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#2c1810" }}>
                  Catatan (opsional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#d4a853" }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: "#2d6a4f" }}
              >
                {loading ? "Memproses..." : editingId ? "Update Data" : "Simpan Data"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Cari nama barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-lg border text-sm outline-none w-full sm:w-64"
            style={{ borderColor: "#e8e4dc" }}
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border text-sm outline-none"
            style={{ borderColor: "#e8e4dc" }}
          />
        </div>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 rounded-lg text-sm font-medium border"
          style={{ borderColor: "#2d6a4f", color: "#2d6a4f" }}
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#f7f5f0" }}>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "#2c1810" }}>Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "#2c1810" }}>Nama Barang</th>
                <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "#2c1810" }}>Awal</th>
                <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "#2c1810" }}>Masuk</th>
                <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "#2c1810" }}>Keluar</th>
                <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "#2c1810" }}>Akhir</th>
                <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "#2c1810" }}>Selisih</th>
                <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: "#2c1810" }}>Status</th>
                {isAdmin && <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: "#2c1810" }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="px-4 py-8 text-center text-sm" style={{ color: "#9a7a6a" }}>
                    Tidak ada data stok
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const status = getStockStatus(record.finalStock);
                  return (
                    <tr key={record.id} className="border-b" style={{ borderColor: "#f0e8e0" }}>
                      <td className="px-4 py-3 text-sm" style={{ color: "#5a3a2a" }}>
                        {new Date(record.date).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: "#2c1810" }}>
                        {record.itemName}
                      </td>
                      <td className="px-4 py-3 text-sm text-right" style={{ color: "#5a3a2a" }}>
                        {record.initialStock}
                      </td>
                      <td className="px-4 py-3 text-sm text-right" style={{ color: "#22c55e" }}>
                        +{record.incoming}
                      </td>
                      <td className="px-4 py-3 text-sm text-right" style={{ color: "#ef4444" }}>
                        -{record.outgoing}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold" style={{ color: "#2c1810" }}>
                        {record.finalStock}
                      </td>
                      <td className="px-4 py-3 text-sm text-right" style={{ color: record.difference >= 0 ? "#22c55e" : "#ef4444" }}>
                        {record.difference > 0 ? `+${record.difference}` : record.difference}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded-full text-white"
                          style={{ backgroundColor: status.color }}
                        >
                          {status.label}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(record)}
                              className="text-xs px-2 py-1 rounded"
                              style={{ color: "#2d6a4f" }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="text-xs px-2 py-1 rounded"
                              style={{ color: "#ef4444" }}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
