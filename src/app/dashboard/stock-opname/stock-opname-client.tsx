"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";

type StockItem = { id: string; name: string; unit: string; currentStock: number; minStock: number };
type OpnameItem = { id: string; stockItem: StockItem; systemStock: number; actualStock: number; difference: number };
type StockOpname = { id: string; date: string; notes: string | null; createdById: string; opnameItems: OpnameItem[]; createdAt: string };

type ToastType = "success" | "error";
type Toast = { message: string; type: ToastType } | null;

function ToastNotification({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  if (!toast) return null;
  return (
    <div
      className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-medium animate-fade-in"
      style={{ backgroundColor: toast.type === "success" ? "#2d6a4f" : "#991b1b" }}
    >
      <span>{toast.type === "success" ? "✅" : "❌"}</span>
      <span>{toast.message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  );
}

export default function StockOpnameClient({
  stockItems: initialStockItems,
  opnameList: initialOpnameList,
}: {
  stockItems: StockItem[];
  opnameList: StockOpname[];
}) {
  const { data: session } = useSession();
  const [stockItems, setStockItems] = useState<StockItem[]>(initialStockItems);
  const [opnameList, setOpnameList] = useState<StockOpname[]>(initialOpnameList);
  const [showModal, setShowModal] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [showEditStock, setShowEditStock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingOpnameId, setDeletingOpnameId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [selectedOpname, setSelectedOpname] = useState<StockOpname | null>(null);
  const [notes, setNotes] = useState("");
  const [actualStocks, setActualStocks] = useState<Record<string, string>>({});
  const [newStock, setNewStock] = useState({ name: "", unit: "kg", currentStock: "", minStock: "" });
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  function showToast(message: string, type: ToastType) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  const refreshStockItems = useCallback(async () => {
    const res = await fetch("/api/stock-items");
    if (res.ok) {
      const data = await res.json();
      setStockItems(data);
    }
  }, []);

  const refreshOpnameList = useCallback(async () => {
    const res = await fetch("/api/stock-opname");
    if (res.ok) {
      const data = await res.json();
      setOpnameList(data);
    }
  }, []);

  function openNewOpname() {
    const init: Record<string, string> = {};
    stockItems.forEach((s) => { init[s.id] = String(s.currentStock); });
    setActualStocks(init);
    setNotes("");
    setShowModal(true);
  }

  async function handleSubmitOpname(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const items = stockItems.map((s) => ({
        stockItemId: s.id,
        systemStock: s.currentStock,
        actualStock: parseFloat(actualStocks[s.id] ?? String(s.currentStock)),
        difference: parseFloat(actualStocks[s.id] ?? String(s.currentStock)) - s.currentStock,
      }));

      const res = await fetch("/api/stock-opname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes,
          items,
          createdById: (session?.user as { id?: string })?.id ?? "",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal menyimpan opname");
      }

      const data = await res.json();
      // Update stockItems from response
      if (data.stockItems) setStockItems(data.stockItems);
      // Refresh opname list
      await refreshOpnameList();
      setShowModal(false);
      showToast("Opname berhasil disimpan!", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddStockItem(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/stock-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStock.name.trim(),
          unit: newStock.unit,
          currentStock: parseFloat(newStock.currentStock) || 0,
          minStock: parseFloat(newStock.minStock) || 0,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal menambahkan item");
      }

      const created = await res.json();
      setStockItems((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setShowAddStock(false);
      setNewStock({ name: "", unit: "kg", currentStock: "", minStock: "" });
      showToast("Item stok berhasil ditambahkan!", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleEditStockItem(e: React.FormEvent) {
    e.preventDefault();
    if (!editingStock) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/stock-items/${editingStock.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingStock.name.trim(),
          unit: editingStock.unit,
          currentStock: editingStock.currentStock,
          minStock: editingStock.minStock,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal mengupdate item");
      }

      const updated = await res.json();
      setStockItems((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)).sort((a, b) => a.name.localeCompare(b.name))
      );
      setShowEditStock(false);
      setEditingStock(null);
      showToast("Item stok berhasil diupdate!", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteStockItem(item: StockItem) {
    if (!confirm(`Yakin ingin menghapus item "${item.name}"? Semua riwayat opname terkait akan ikut terhapus.`)) return;
    setDeletingItemId(item.id);
    try {
      const res = await fetch(`/api/stock-items/${item.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal menghapus item");
      }
      setStockItems((prev) => prev.filter((s) => s.id !== item.id));
      // Refresh opname list because related items are removed
      await refreshOpnameList();
      showToast(`Item "${item.name}" berhasil dihapus.`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Terjadi kesalahan", "error");
    } finally {
      setDeletingItemId(null);
    }
  }

  async function handleDeleteOpname(opname: StockOpname) {
    if (!confirm(`Yakin ingin menghapus catatan opname tanggal ${new Date(opname.date).toLocaleDateString("id-ID")}?`)) return;
    setDeletingOpnameId(opname.id);
    try {
      const res = await fetch(`/api/stock-opname?id=${opname.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal menghapus opname");
      }
      setOpnameList((prev) => prev.filter((op) => op.id !== opname.id));
      if (selectedOpname?.id === opname.id) setSelectedOpname(null);
      showToast("Catatan opname berhasil dihapus.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Terjadi kesalahan", "error");
    } finally {
      setDeletingOpnameId(null);
    }
  }

  return (
    <div>
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#2c1810", fontFamily: "Georgia, serif" }}>
            Stock Opname
          </h1>
          <p className="text-sm mt-1" style={{ color: "#5a3a2a" }}>{stockItems.length} item stok terdaftar</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddStock(true)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium border transition-opacity hover:opacity-80"
            style={{ borderColor: "#8b4513", color: "#8b4513" }}
          >
            + Item Baru
          </button>
          <button
            onClick={openNewOpname}
            disabled={stockItems.length === 0}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: "#8b4513" }}
          >
            📋 Opname Baru
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Stock Items */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b" style={{ borderColor: "#f0e8e0" }}>
            <h2 className="font-semibold" style={{ color: "#2c1810" }}>Daftar Item Stok</h2>
          </div>
          {stockItems.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl">📦</span>
              <p className="mt-3 text-sm" style={{ color: "#9a7a6a" }}>Belum ada item stok. Klik "+ Item Baru" untuk menambahkan.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#f0e8e0" }}>
              {stockItems.map((item) => {
                const isLow = item.currentStock <= item.minStock;
                const isDeleting = deletingItemId === item.id;
                return (
                  <div key={item.id} className="px-6 py-4 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#2c1810" }}>{item.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#9a7a6a" }}>
                        Min: {item.minStock} {item.unit}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold" style={{ color: isLow ? "#991b1b" : "#065f46" }}>
                        {item.currentStock} {item.unit}
                      </p>
                      {isLow && (
                        <span className="text-xs font-medium" style={{ color: "#991b1b" }}>⚠ Stok Rendah</span>
                      )}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => { setEditingStock({ ...item }); setShowEditStock(true); }}
                        className="text-xs px-2 py-1 rounded-lg border transition-opacity hover:opacity-70"
                        style={{ borderColor: "#d4a853", color: "#8b4513" }}
                        title="Edit item"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteStockItem(item)}
                        disabled={isDeleting}
                        className="text-xs px-2 py-1 rounded-lg border transition-opacity hover:opacity-70 disabled:opacity-40"
                        style={{ borderColor: "#fecaca", color: "#991b1b" }}
                        title="Hapus item"
                      >
                        {isDeleting ? "..." : "🗑️"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Opname History */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b" style={{ borderColor: "#f0e8e0" }}>
            <h2 className="font-semibold" style={{ color: "#2c1810" }}>Riwayat Opname</h2>
          </div>
          {opnameList.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl">📋</span>
              <p className="mt-3 text-sm" style={{ color: "#9a7a6a" }}>Belum ada riwayat opname</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#f0e8e0" }}>
              {opnameList.map((op) => (
                <div key={op.id} className="flex items-start">
                  <button
                    className="flex-1 px-6 py-4 flex items-center justify-between hover:bg-amber-50 transition-colors text-left"
                    onClick={() => setSelectedOpname(selectedOpname?.id === op.id ? null : op)}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#2c1810" }}>
                        {new Date(op.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#9a7a6a" }}>
                        {op.opnameItems.length} item diperiksa
                        {op.notes ? ` · ${op.notes}` : ""}
                      </p>
                    </div>
                    <span className="text-xs ml-2" style={{ color: "#8b4513" }}>
                      {selectedOpname?.id === op.id ? "▲" : "▼"}
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteOpname(op)}
                    disabled={deletingOpnameId === op.id}
                    className="px-3 py-4 text-xs hover:opacity-70 transition-opacity disabled:opacity-30 self-stretch flex items-center"
                    style={{ color: "#991b1b" }}
                    title="Hapus opname"
                  >
                    {deletingOpnameId === op.id ? "..." : "🗑️"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Opname Detail */}
      {selectedOpname && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "#f0e8e0" }}>
            <div>
              <h2 className="font-semibold" style={{ color: "#2c1810" }}>
                Detail Opname – {new Date(selectedOpname.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </h2>
              {selectedOpname.notes && <p className="text-xs mt-1" style={{ color: "#9a7a6a" }}>{selectedOpname.notes}</p>}
            </div>
            <button onClick={() => setSelectedOpname(null)} className="text-xl leading-none opacity-40 hover:opacity-80" style={{ color: "#2c1810" }}>×</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "#fdf1e0" }}>
                  {["Item", "Stok Sistem", "Stok Aktual", "Selisih"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#5a3a2a" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedOpname.opnameItems.map((oi, i) => (
                  <tr key={oi.id} style={{ borderTop: i > 0 ? "1px solid #f0e8e0" : undefined }}>
                    <td className="px-6 py-3 text-sm font-medium" style={{ color: "#2c1810" }}>{oi.stockItem.name}</td>
                    <td className="px-6 py-3 text-sm" style={{ color: "#5a3a2a" }}>{oi.systemStock} {oi.stockItem.unit}</td>
                    <td className="px-6 py-3 text-sm" style={{ color: "#5a3a2a" }}>{oi.actualStock} {oi.stockItem.unit}</td>
                    <td className="px-6 py-3 text-sm font-medium" style={{ color: oi.difference < 0 ? "#991b1b" : oi.difference > 0 ? "#065f46" : "#5a3a2a" }}>
                      {oi.difference > 0 ? "+" : ""}{oi.difference} {oi.stockItem.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Opname Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(44,24,16,0.5)" }}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: "#2c1810" }}>Opname Stok Baru</h2>
              <button onClick={() => setShowModal(false)} disabled={loading} className="text-xl leading-none opacity-40 hover:opacity-80">×</button>
            </div>
            <form onSubmit={handleSubmitOpname} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#5a3a2a" }}>Catatan (opsional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan opname..."
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#d4a853" }}
                />
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#5a3a2a" }}>Masukkan Stok Aktual</p>
                {stockItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "#fdf8f4" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#2c1810" }}>
                        {item.name} <span className="opacity-50 text-xs">({item.unit})</span>
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#9a7a6a" }}>Sistem: {item.currentStock} {item.unit}</p>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={actualStocks[item.id] ?? ""}
                      onChange={(e) => setActualStocks({ ...actualStocks, [item.id]: e.target.value })}
                      className="w-28 px-3 py-1.5 rounded-lg border text-sm outline-none text-center font-medium"
                      style={{ borderColor: "#d4a853" }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl border text-sm font-medium disabled:opacity-40"
                  style={{ borderColor: "#d4a853", color: "#8b4513" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60"
                  style={{ backgroundColor: "#8b4513" }}
                >
                  {loading ? "Menyimpan..." : "Simpan Opname"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Item Modal */}
      {showAddStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(44,24,16,0.5)" }}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: "#2c1810" }}>Tambah Item Stok</h2>
              <button onClick={() => setShowAddStock(false)} disabled={loading} className="text-xl leading-none opacity-40 hover:opacity-80">×</button>
            </div>
            <form onSubmit={handleAddStockItem} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#5a3a2a" }}>Nama Item</label>
                <input
                  type="text"
                  required
                  value={newStock.name}
                  onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
                  placeholder="Contoh: Gula Pasir"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#d4a853" }}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#5a3a2a" }}>Satuan</label>
                  <select
                    value={newStock.unit}
                    onChange={(e) => setNewStock({ ...newStock, unit: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: "#d4a853" }}
                  >
                    {["kg", "liter", "pcs", "gram", "ml", "botol", "sachet", "lusin", "pak"].map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#5a3a2a" }}>Stok Awal</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newStock.currentStock}
                    onChange={(e) => setNewStock({ ...newStock, currentStock: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: "#d4a853" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#5a3a2a" }}>Min Stok</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newStock.minStock}
                    onChange={(e) => setNewStock({ ...newStock, minStock: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: "#d4a853" }}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddStock(false); setNewStock({ name: "", unit: "kg", currentStock: "", minStock: "" }); }}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl border text-sm font-medium disabled:opacity-40"
                  style={{ borderColor: "#d4a853", color: "#8b4513" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60"
                  style={{ backgroundColor: "#8b4513" }}
                >
                  {loading ? "Menyimpan..." : "Simpan Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Stock Item Modal */}
      {showEditStock && editingStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(44,24,16,0.5)" }}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: "#2c1810" }}>Edit Item Stok</h2>
              <button onClick={() => { setShowEditStock(false); setEditingStock(null); }} disabled={loading} className="text-xl leading-none opacity-40 hover:opacity-80">×</button>
            </div>
            <form onSubmit={handleEditStockItem} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#5a3a2a" }}>Nama Item</label>
                <input
                  type="text"
                  required
                  value={editingStock.name}
                  onChange={(e) => setEditingStock({ ...editingStock, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#d4a853" }}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#5a3a2a" }}>Satuan</label>
                  <select
                    value={editingStock.unit}
                    onChange={(e) => setEditingStock({ ...editingStock, unit: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: "#d4a853" }}
                  >
                    {["kg", "liter", "pcs", "gram", "ml", "botol", "sachet", "lusin", "pak"].map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#5a3a2a" }}>Stok Saat Ini</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingStock.currentStock}
                    onChange={(e) => setEditingStock({ ...editingStock, currentStock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: "#d4a853" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#5a3a2a" }}>Min Stok</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingStock.minStock}
                    onChange={(e) => setEditingStock({ ...editingStock, minStock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: "#d4a853" }}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditStock(false); setEditingStock(null); }}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl border text-sm font-medium disabled:opacity-40"
                  style={{ borderColor: "#d4a853", color: "#8b4513" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60"
                  style={{ backgroundColor: "#8b4513" }}
                >
                  {loading ? "Menyimpan..." : "Update Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
