"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email atau password salah. Silakan coba lagi.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f7f5f0" }}>
      {/* Left Panel */}
      <div
        className="hidden md:flex md:w-1/2 flex-col items-center justify-center p-12 text-white"
        style={{ backgroundColor: "#1a2e1a" }}
      >
        <div className="max-w-sm text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Image
              src="/images/logo.png"
              alt="Morning Mama Logo"
              width={64}
              height={64}
              className="rounded-full"
            />
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Morning Mama
          </h1>
          <p className="text-base opacity-70 leading-7">
            Portal khusus untuk admin dan staff Morning Mama Cafe Banda Aceh.
          </p>
          <div className="mt-10 pt-10 border-t border-white/20">
            <p className="text-xs opacity-50 tracking-widest uppercase">Banda Aceh, Aceh</p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="md:hidden text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Image
                src="/images/logo.png"
                alt="Morning Mama Logo"
                width={48}
                height={48}
                className="rounded-full"
              />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: "#2d6a4f", fontFamily: "Georgia, serif" }}>
              Morning Mama
            </h1>
          </div>

          <h2 className="text-2xl font-bold mb-2" style={{ color: "#1a2e1a" }}>
            Masuk ke Dashboard
          </h2>
          <p className="text-sm mb-8" style={{ color: "#2d3a2d" }}>
            Silakan login dengan akun staff Anda
          </p>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1a2e1a" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@morningmama.com"
                required
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors"
                style={{
                  borderColor: "#d4a853",
                  backgroundColor: "#fff",
                  color: "#1a2e1a",
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1a2e1a" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors"
                style={{
                  borderColor: "#d4a853",
                  backgroundColor: "#fff",
                  color: "#1a2e1a",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "#2d6a4f" }}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: "#2d3a2d" }}>
            <Link href="/" className="hover:underline" style={{ color: "#2d6a4f" }}>
              ← Kembali ke Beranda
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
