"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };
type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  category: Category;
  categoryId: string;
};

export default function MenuClient({
  menuItems,
  categories,
}: {
  menuItems: MenuItem[];
  categories: Category[];
}) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterCat, setFilterCat] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    categoryId: "",
    isAvailable: true,
  });
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  function openAdd() {
    setEditItem(null);
    setForm({ name: "", description: "", price: "", imageUrl: "", categoryId: categories[0]?.id ?? "", isAvailable: true });
    setShowModal(true);
  }

  function openEdit(item: MenuItem) {
    setEditItem(item);
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      imageUrl: item.imageUrl ?? "",
      categoryId: item.categoryId,
      isAvailable: item.isAvailable,
    });
    setShowModal(true);
  }

  async function handleFileUpload(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const body = { ...form, price: parseFloat(form.price) };
    const url = editItem ? `/api/menu/${editItem.id}` : "/api/menu";
    const method = editItem ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setLoading(false);
    setShowModal(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus item ini?")) return;
    await fetch(`/api/menu/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const filtered = filterCat ? menuItems.filter((m) => m.categoryId === filterCat) : menuItems;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#2c1810", fontFamily: "Georgia, serif" }}>
            Manajemen Menu
          </h1>
          <p className="text-sm mt-1" style={{ color: "#5a3a2a" }}>{menuItems.length} item tersedia</p>
        </div>
        <button
          onClick={openAdd}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#8b4513" }}
        >
          + Tambah Menu
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={() => setFilterCat("")}
          className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
          style={{
            backgroundColor: filterCat === "" ? "#8b4513" : "#fdf1e0",
            color: filterCat === "" ? "#fff" : "#5a3a2a",
          }}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCat(cat.id)}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              backgroundColor: filterCat === cat.id ? "#8b4513" : "#fdf1e0",
              color: filterCat === cat.id ? "#fff" : "#5a3a2a",
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl">🍽️</span>
            <p className="mt-4 text-sm" style={{ color: "#9a7a6a" }}>Belum ada item menu. Tambahkan yang pertama!</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#fdf1e0" }}>
                {["Nama", "Kategori", "Harga", "Status", "Aksi"].map((h) => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "#5a3a2a" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr
                  key={item.id}
                  style={{ borderTop: i > 0 ? "1px solid #f0e8e0" : undefined }}
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-sm" style={{ color: "#2c1810" }}>{item.name}</p>
                    {item.description && (
                      <p className="text-xs mt-0.5 truncate max-w-48" style={{ color: "#9a7a6a" }}>{item.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: "#fdf1e0", color: "#8b4513" }}>
                      {item.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium" style={{ color: "#2c1810" }}>
                    Rp {item.price.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: item.isAvailable ? "#d1fae5" : "#fee2e2",
                        color: item.isAvailable ? "#065f46" : "#991b1b",
                      }}
                    >
                      {item.isAvailable ? "Tersedia" : "Habis"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                        style={{ backgroundColor: "#fdf1e0", color: "#8b4513" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                        style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(44,24,16,0.5)" }}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-6" style={{ color: "#2c1810" }}>
              {editItem ? "Edit Menu" : "Tambah Menu Baru"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#5a3a2a" }}>Nama Menu</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "#d4a853" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#5a3a2a" }}>Deskripsi</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none"
                  style={{ borderColor: "#d4a853" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#5a3a2a" }}>Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: "#d4a853" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#5a3a2a" }}>Kategori</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: "#d4a853" }}
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#5a3a2a" }}>Foto Menu (opsional)</label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    dragOver ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-green-400"
                  }`}
                  style={{ borderColor: dragOver ? "#22c55e" : "#d4a853" }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith("image/")) {
                      setUploading(true);
                      const base64 = await handleFileUpload(file);
                      setForm({ ...form, imageUrl: base64 });
                      setUploading(false);
                    }
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploading(true);
                        const base64 = await handleFileUpload(file);
                        setForm({ ...form, imageUrl: base64 });
                        setUploading(false);
                      }
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer block"
                  >
                    {form.imageUrl ? (
                      <div className="relative">
                        <img src={form.imageUrl} alt="Preview" className="max-h-32 mx-auto rounded-lg" />
                        <p className="text-xs mt-2" style={{ color: "#5a3a2a" }}>Klik untuk ganti foto</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl block mb-2">📷</span>
                        <p className="text-sm" style={{ color: "#5a3a2a" }}>
                          {uploading ? "Mengunggah..." : "Klik atau drag foto ke sini"}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "#9a7a6a" }}>JPG, PNG (max 5MB)</p>
                      </div>
                    )}
                  </label>
                  {form.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: "" })}
                      className="mt-2 text-xs text-red-600 hover:text-red-700"
                    >
                      Hapus foto
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={form.isAvailable}
                  onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                />
                <label htmlFor="isAvailable" className="text-sm" style={{ color: "#2c1810" }}>Tersedia</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border text-sm font-medium"
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
