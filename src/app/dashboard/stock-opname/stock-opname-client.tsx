"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type StockItem = { id: string; name: string; unit: string; currentStock: number; minStock: number };
type OpnameItem = { id: string; stockItem: StockItem; systemStock: number; actualStock: number; difference: number };
type StockOpname = { id: string; date: string; notes: string | null; createdById: string; opnameItems: OpnameItem[]; createdAt: string };

export default function StockOpnameClient({
  stockItems,
  opnameList,
}: {
  stockItems: StockItem[];
  opnameList: StockOpname[];
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedOpname, setSelectedOpname] = useState<StockOpname | null>(null);
  const [notes, setNotes] = useState("");
  const [actualStocks, setActualStocks] = useState<Record<string, string>>({});
  const [newStock, setNewStock] = useState({ name: "", unit: "kg", currentStock: "", minStock: "" });

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
    const items = stockItems.map((s) => ({
      stockItemId: s.id,
      systemStock: s.currentStock,
      actualStock: parseFloat(actualStocks[s.id] ?? String(s.currentStock)),
      difference: parseFloat(actualStocks[s.id] ?? String(s.currentStock)) - s.currentStock,
    }));
    await fetch("/api/stock-opname", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes, items, createdById: (session?.user as { id?: string })?.id ?? "" }),
    });
    setLoading(false);
    setShowModal(false);
    router.refresh();
  }

  async function handleAddStockItem(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/stock-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newStock.name,
        unit: newStock.unit,
        currentStock: parseFloat(newStock.currentStock),
        minStock: parseFloat(newStock.minStock),
      }),
    });
    setLoading(false);
    setShowAddStock(false);
    setNewStock({ name: "", unit: "kg", currentStock: "", minStock: "" });
    router.refresh();
  }

  return (
    <div>
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
              <p className="mt-3 text-sm" style={{ color: "#9a7a6a" }}>Belum ada item stok</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#f0e8e0" }}>
              {stockItems.map((item) => {
                const isLow = item.currentStock <= item.minStock;
                return (
                  <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#2c1810" }}>{item.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#9a7a6a" }}>
                        Min: {item.minStock} {item.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: isLow ? "#991b1b" : "#065f46" }}>
                        {item.currentStock} {item.unit}
                      </p>
                      {isLow && (
                        <span className="text-xs font-medium" style={{ color: "#991b1b" }}>⚠ Stok Rendah</span>
                      )}
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
                <button
                  key={op.id}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-amber-50 transition-colors text-left"
                  onClick={() => setSelectedOpname(selectedOpname?.id === op.id ? null : op)}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#2c1810" }}>
                      {new Date(op.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#9a7a6a" }}>
                      {op.opnameItems.length} item diperiksa
                    </p>
                  </div>
                  <span className="text-xs" style={{ color: "#8b4513" }}>
                    {selectedOpname?.id === op.id ? "▲" : "▼"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Opname Detail */}
      {selectedOpname && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b" style={{ borderColor: "#f0e8e0" }}>
            <h2 className="font-semibold" style={{ color: "#2c1810" }}>
              Detail Opname – {new Date(selectedOpname.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </h2>
            {selectedOpname.notes && <p className="text-xs mt-1" style={{ color: "#9a7a6a" }}>{selectedOpname.notes}</p>}
          </div>
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
      )}

      {/* New Opname Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(44,24,16,0.5)" }}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-6" style={{ color: "#2c1810" }}>Opname Stok Baru</h2>
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
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#5a3a2a" }}>Stok Aktual</p>
                {stockItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="flex-1 text-sm" style={{ color: "#2c1810" }}>
                      {item.name} <span className="opacity-50">({item.unit})</span>
                    </span>
                    <span className="text-xs" style={{ color: "#9a7a6a" }}>Sistem: {item.currentStock}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={actualStocks[item.id] ?? ""}
                      onChange={(e) => setActualStocks({ ...actualStocks, [item.id]: e.target.value })}
                      className="w-24 px-3 py-1.5 rounded-lg border text-sm outline-none text-center"
                      style={{ borderColor: "#d4a853" }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: "#d4a853", color: "#8b4513" }}>Batal</button>
                <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60" style={{ backgroundColor: "#8b4513" }}>
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
            <h2 className="text-lg font-bold mb-6" style={{ color: "#2c1810" }}>Tambah Item Stok</h2>
            <form onSubmit={handleAddStockItem} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#5a3a2a" }}>Nama Item</label>
                <input type="text" required value={newStock.name} onChange={(e) => setNewStock({ ...newStock, name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: "#d4a853" }} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#5a3a2a" }}>Satuan</label>
                  <select value={newStock.unit} onChange={(e) => setNewStock({ ...newStock, unit: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: "#d4a853" }}>
                    {["kg", "liter", "pcs", "gram", "ml", "botol", "sachet"].map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#5a3a2a" }}>Stok Awal</label>
                  <input type="number" step="0.01" required value={newStock.currentStock} onChange={(e) => setNewStock({ ...newStock, currentStock: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: "#d4a853" }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#5a3a2a" }}>Min Stok</label>
                  <input type="number" step="0.01" required value={newStock.minStock} onChange={(e) => setNewStock({ ...newStock, minStock: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: "#d4a853" }} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddStock(false)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: "#d4a853", color: "#8b4513" }}>Batal</button>
                <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60" style={{ backgroundColor: "#8b4513" }}>
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
