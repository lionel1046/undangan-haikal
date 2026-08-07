"use client";

import { useState, useCallback, useEffect } from "react";

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

type ToastType = "success" | "error";
type Toast = { message: string; type: ToastType } | null;

function ToastNotification({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  if (!toast) return null;
  return (
    <div
      className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-medium"
      style={{ backgroundColor: toast.type === "success" ? "#2d6a4f" : "#991b1b" }}
    >
      <span>{toast.type === "success" ? "✅" : "❌"}</span>
      <span>{toast.message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
}

function computeStats(records: StockRecord[]): Stats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayRecords = records.filter((r) => {
    const d = new Date(r.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
  return {
    totalItems: records.length,
    totalOutToday: todayRecords.reduce((sum, r) => sum + r.outgoing, 0),
    lowStockCount: todayRecords.filter((r) => r.finalStock < 10).length,
    totalStockAvailable: todayRecords.reduce((sum, r) => sum + r.finalStock, 0),
  };
}

export default function StokBarangClient({
  isAdmin,
}: {
  isAdmin: boolean;
}) {
  const [records, setRecords] = useState<StockRecord[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalItems: 0,
    totalOutToday: 0,
    lowStockCount: 0,
    totalStockAvailable: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const response = await fetch("/api/stock-records");
      const data = await response.json();
      setRecords(data);
      setStats(computeStats(data));
    } catch (error) {
      console.error("Failed to fetch stock records:", error);
    } finally {
      setLoading(false);
    }
  }

  const [formData, setFormData] = useState({
    itemName: "",
    initialStock: "",
    incoming: "",
    outgoing: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  function showToast(message: string, type: ToastType) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  function getStockStatus(finalStock: number): { label: string; color: string } {
    if (finalStock < 10) return { label: "Perlu Refill", color: "#ef4444" };
    if (finalStock <= 20) return { label: "Menipis", color: "#f59e0b" };
    return { label: "Aman", color: "#22c55e" };
  }

  /** Fetch all records from server and update state + stats */
  const refreshRecords = useCallback(async () => {
    await fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const initialStock = parseFloat(formData.initialStock) || 0;
    const incoming = parseFloat(formData.incoming) || 0;
    const outgoing = parseFloat(formData.outgoing) || 0;
    const finalStock = initialStock + incoming - outgoing;
    const difference = finalStock - initialStock;

    const payload = {
      itemName: formData.itemName.trim(),
      initialStock,
      incoming,
      outgoing,
      finalStock,
      difference,
      date: new Date(formData.date).toISOString(),
      notes: formData.notes || null,
    };

    try {
      let res: Response;
      if (editingId) {
        res = await fetch(`/api/stock-records/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/stock-records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal menyimpan data");
      }

      const saved: StockRecord = await res.json();

      if (editingId) {
        // Replace the edited record in local state
        setRecords((prev) => {
          const updated = prev.map((r) => (r.id === saved.id ? saved : r));
          setStats(computeStats(updated));
          return updated;
        });
        showToast("Data stok berhasil diupdate!", "success");
      } else {
        // Prepend new record and refresh for accurate ordering
        setRecords((prev) => {
          const updated = [saved, ...prev];
          setStats(computeStats(updated));
          return updated;
        });
        showToast("Data stok berhasil ditambahkan!", "success");
      }

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
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/stock-records/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal menghapus data");
      }
      setRecords((prev) => {
        const updated = prev.filter((r) => r.id !== id);
        setStats(computeStats(updated));
        return updated;
      });
      showToast("Data stok berhasil dihapus.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Terjadi kesalahan", "error");
    } finally {
      setDeletingId(null);
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

  function handleCloseForm() {
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
  }

  function exportToCSV() {
    const headers = ["Tanggal", "Nama Barang", "Stok Awal", "Stok Masuk", "Stok Keluar", "Stok Akhir", "Selisih", "Status", "Catatan"];
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
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
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

  // Live final stock preview in form
  const previewFinal =
    (parseFloat(formData.initialStock) || 0) +
    (parseFloat(formData.incoming) || 0) -
    (parseFloat(formData.outgoing) || 0);

  return (
    <div>
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#2c1810", fontFamily: "Georgia, serif" }}>
            Stok Barang
          </h1>
          <p className="text-sm mt-1" style={{ color: "#5a3a2a" }}>
            Kelola dan pantau stok barang harian
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshRecords}
            className="px-3 py-2 rounded-lg text-sm font-medium border transition-opacity hover:opacity-70"
            style={{ borderColor: "#e8e4dc", color: "#5a3a2a" }}
            title="Muat ulang data"
          >
            🔄 Refresh
          </button>
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
            className="px-4 py-2 rounded-lg text-white font-medium text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#2d6a4f" }}
          >
            + Tambah Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: "📦", label: "Total Catatan", value: stats.totalItems, color: "#8b4513", badge: "Total" },
          { icon: "📤", label: "Stok Keluar Hari Ini", value: stats.totalOutToday, color: "#c4763a", badge: "Hari Ini" },
          { icon: "⚠️", label: "Perlu Refill", value: stats.lowStockCount, color: "#ef4444", badge: "Kritis" },
          { icon: "✅", label: "Total Stok Tersedia", value: stats.totalStockAvailable, color: "#22c55e", badge: "Tersedia" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ backgroundColor: s.color }}>
                {s.badge}
              </span>
            </div>
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-sm mt-1" style={{ color: "#5a3a2a" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={handleCloseForm}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: "#2c1810", fontFamily: "Georgia, serif" }}>
                {editingId ? "Edit Data Stok" : "Tambah Data Stok"}
              </h2>
              <button onClick={handleCloseForm} disabled={loading} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#2c1810" }}>Nama Barang</label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  required
                  placeholder="Contoh: Gula Pasir"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#d4a853" }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#2c1810" }}>Stok Awal</label>
                  <input
                    type="number"
                    value={formData.initialStock}
                    onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: "#d4a853" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#22c55e" }}>Masuk</label>
                  <input
                    type="number"
                    value={formData.incoming}
                    onChange={(e) => setFormData({ ...formData, incoming: e.target.value })}
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: "#d4a853" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#ef4444" }}>Keluar</label>
                  <input
                    type="number"
                    value={formData.outgoing}
                    onChange={(e) => setFormData({ ...formData, outgoing: e.target.value })}
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: "#d4a853" }}
                  />
                </div>
              </div>

              {/* Live preview */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: "#f0f7f3" }}>
                <span className="text-sm font-medium" style={{ color: "#2c1810" }}>Stok Akhir (Kalkulasi)</span>
                <span className="text-lg font-bold" style={{ color: previewFinal < 10 ? "#ef4444" : "#2d6a4f" }}>
                  {previewFinal.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#2c1810" }}>Tanggal</label>
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
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#2c1810" }}>Catatan (opsional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Catatan tambahan..."
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none resize-none"
                  style={{ borderColor: "#d4a853" }}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-medium text-sm border disabled:opacity-40"
                  style={{ borderColor: "#d4a853", color: "#8b4513" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: "#2d6a4f" }}
                >
                  {loading ? "Memproses..." : editingId ? "Update Data" : "Simpan Data"}
                </button>
              </div>
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
          {(searchTerm || dateFilter) && (
            <button
              onClick={() => { setSearchTerm(""); setDateFilter(""); }}
              className="px-4 py-2 rounded-lg border text-sm"
              style={{ borderColor: "#e8e4dc", color: "#9a7a6a" }}
            >
              Reset Filter
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm" style={{ color: "#9a7a6a" }}>
          {filteredRecords.length} data
          <button
            onClick={exportToCSV}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-opacity hover:opacity-70"
            style={{ borderColor: "#2d6a4f", color: "#2d6a4f" }}
          >
            📥 Export CSV
          </button>
        </div>
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
                <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "#22c55e" }}>Masuk</th>
                <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "#ef4444" }}>Keluar</th>
                <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "#2c1810" }}>Akhir</th>
                <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "#2c1810" }}>Selisih</th>
                <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: "#2c1810" }}>Status</th>
                {isAdmin && <th className="px-4 py-3 text-center text-xs font-semibold" style={{ color: "#2c1810" }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="px-4 py-12 text-center" style={{ color: "#9a7a6a" }}>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📊</span>
                      <p className="text-sm">{searchTerm || dateFilter ? "Tidak ada data yang cocok dengan filter" : "Belum ada data stok"}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const status = getStockStatus(record.finalStock);
                  const isDeleting = deletingId === record.id;
                  return (
                    <tr
                      key={record.id}
                      className="border-b transition-colors hover:bg-amber-50/30"
                      style={{ borderColor: "#f0e8e0", opacity: isDeleting ? 0.4 : 1 }}
                    >
                      <td className="px-4 py-3 text-sm" style={{ color: "#5a3a2a" }}>
                        {new Date(record.date).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: "#2c1810" }}>
                        {record.itemName}
                        {record.notes && (
                          <p className="text-xs font-normal mt-0.5 truncate max-w-32" style={{ color: "#9a7a6a" }}>{record.notes}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-right" style={{ color: "#5a3a2a" }}>{record.initialStock}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: "#22c55e" }}>
                        {record.incoming > 0 ? `+${record.incoming}` : record.incoming}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: "#ef4444" }}>
                        {record.outgoing > 0 ? `-${record.outgoing}` : record.outgoing}
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
                              className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-opacity hover:opacity-70"
                              style={{ borderColor: "#d4a853", color: "#2d6a4f" }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(record.id)}
                              disabled={isDeleting}
                              className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-opacity hover:opacity-70 disabled:opacity-30"
                              style={{ borderColor: "#fecaca", color: "#ef4444" }}
                            >
                              {isDeleting ? "..." : "Hapus"}
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
