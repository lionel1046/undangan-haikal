"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const menuHighlights = [
  {
    name: "Mama with Sunshine",
    desc: "Matcha 1 liter segar, tersedia dalam kemasan 500ml & 1 liter. Bisa pesan via GrabFood & GoFood.",
    price: "mulai Rp 35.000",
    img: "/images/menu-matcha.jpeg",
  },
  {
    name: "Lotus Biscoff",
    desc: "Kreasi spesial minuman latte dengan lotus biscoff yang creamy dan gurih.",
    price: "Rp 38.000",
    img: "/images/menu-biscoff.jpeg",
  },
  {
    name: "Basque Burnt Cheesecake",
    desc: "Cheesecake slice lembut dengan topping strawberry jam, disajikan di atas piring hijau khas Morning Mama.",
    price: "Rp 32.000",
    img: "/images/menu-cheesecake.jpeg",
  },
  {
    name: "Mie Wonton Kuah",
    desc: "Semangkuk mie wonton berkuah bening yang hangat dan lezat, sajian andalan Morning Mama.",
    price: "Rp 45.000",
    img: "/images/menu-wonton.jpeg",
  },
];

const galleryImages = [
  "/images/gallery-1.jpeg",
  "/images/gallery-2.jpeg",
  "/images/gallery-3.jpeg",
  "/images/gallery-4.jpeg",
  "/images/gallery-5.jpeg",
  "/images/gallery-6.jpeg",
  "/images/gallery-7.jpeg",
  "/images/gallery-8.jpeg",
  "/images/gallery-9.jpeg",
];

export default function Home() {
  const [showOrderPopup, setShowOrderPopup] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f5f0" }}>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b" style={{ borderColor: "#e8e4dc" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Morning Mama Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-lg font-bold tracking-tight" style={{ color: "#1a2e1a", fontFamily: "Georgia, serif" }}>
              Morning Mama
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[["Tentang", "#tentang"], ["Menu", "#menu"], ["Galeri", "#galeri"], ["Kontak", "#kontak"]].map(([label, href]) => (
              <a key={label} href={href} className="text-sm font-medium transition-colors hover:opacity-60" style={{ color: "#2d3a2d" }}>
                {label}
              </a>
            ))}
          </div>
          <Link
            href="/login"
            className="px-5 py-2 rounded-full text-sm font-medium text-white transition-all hover:opacity-85"
            style={{ backgroundColor: "#2d6a4f" }}
          >
            Staff Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-end pb-20 pt-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.jpeg"
            alt="Morning Mama Cafe Interior"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,30,15,0.85) 0%, rgba(15,30,15,0.35) 50%, rgba(15,30,15,0.1) 100%)" }} />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-4 text-white/60">
              Cafe · Banda Aceh
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-5 leading-tight" style={{ fontFamily: "Georgia, serif" }}>
              Morning<br />Mama
            </h1>
            <p className="text-base md:text-lg text-white/70 mb-8 leading-7 max-w-lg">
              Tempat yang hangat untuk memulai pagi Anda — kopi pilihan, makanan lezat, dan suasana yang nyaman di jantung Banda Aceh.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <a
                href="#menu"
                className="px-6 py-3 sm:px-7 rounded-full text-white font-medium text-sm transition-all hover:opacity-90 w-full sm:w-auto text-center"
                style={{ backgroundColor: "#2d6a4f" }}
              >
                Lihat Menu
              </a>
              <button
                onClick={() => setShowOrderPopup(true)}
                className="px-6 py-3 sm:px-7 rounded-full font-medium text-sm border border-white/40 text-white transition-all hover:bg-white/10 w-full sm:w-auto text-center"
              >
                Pesan Online
              </button>
              <a
                href="https://www.instagram.com/hellomorningmama"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 sm:px-7 rounded-full font-medium text-sm border border-white/40 text-white transition-all hover:bg-white/10 w-full sm:w-auto text-center"
              >
                Instagram
              </a>
              <a
                href="https://www.tiktok.com/@hellomorningmama"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 sm:px-7 rounded-full font-medium text-sm border border-white/40 text-white transition-all hover:bg-white/10 w-full sm:w-auto text-center"
              >
                TikTok
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="tentang" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="rounded-3xl overflow-hidden aspect-[4/5] relative shadow-lg">
              <Image
                src="/images/about.jpeg"
                alt="Suasana Morning Mama"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-4" style={{ color: "#2d6a4f" }}>
              Tentang Kami
            </p>
            <h2 className="text-4xl font-bold mb-6 leading-snug" style={{ color: "#1a2e1a", fontFamily: "Georgia, serif" }}>
              A Cozy Corner for Your Morning Rituals
            </h2>
            <p className="text-base leading-8 mb-4" style={{ color: "#4a5a4a" }}>
              Morning Mama lahir dari mimpi sederhana: menciptakan ruang di mana setiap pagi terasa seperti pelukan hangat. Cafe kami memadukan kenyamanan rumah dengan kualitas kopi artisan.
            </p>
            <p className="text-base leading-8 mb-8" style={{ color: "#4a5a4a" }}>
              Baik untuk ngopi cepat, brunch santai, atau bertemu teman — kami hadir untuk membuat pagi Anda sedikit lebih cerah.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["🌿", "Bahan Segar & Lokal", "Kerjasama dengan petani lokal Aceh"],
                ["☕", "Kopi Artisan", "Biji kopi pilihan diseduh ahli"],
                ["🕖", "Jam Buka", "setiap hari 08.30 - 23.30"],
                ["❤️", "Dibuat dengan Cinta", "Setiap sajian penuh perhatian"],
              ].map(([icon, title, desc]) => (
                <div key={title} className="p-4 rounded-2xl" style={{ backgroundColor: "#f0f7f3" }}>
                  <span className="text-2xl">{icon}</span>
                  <p className="text-sm font-semibold mt-2 mb-1" style={{ color: "#1a2e1a" }}>{title}</p>
                  <p className="text-xs leading-5" style={{ color: "#6a7a6a" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-24 px-6" style={{ backgroundColor: "#f0f7f3" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: "#2d6a4f" }}>
              Menu Pilihan
            </p>
            <h2 className="text-4xl font-bold mb-3" style={{ color: "#1a2e1a", fontFamily: "Georgia, serif" }}>
              Featured Menu
            </h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: "#4a5a4a" }}>
              Sajian pilihan yang diracik dengan bahan-bahan segar setiap harinya
            </p>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {menuHighlights.map((item) => (
              <div key={item.name} className="min-w-[280px] w-[280px] bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300 snap-start">
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-base mb-1.5" style={{ color: "#1a2e1a" }}>{item.name}</h3>
                  <p className="text-xs leading-5 mb-3" style={{ color: "#6a7a6a" }}>{item.desc}</p>
                  <p className="text-sm font-bold" style={{ color: "#2d6a4f" }}>{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="galeri" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: "#2d6a4f" }}>
              Galeri
            </p>
            <h2 className="text-4xl font-bold mb-3" style={{ color: "#1a2e1a", fontFamily: "Georgia, serif" }}>
              @hellomorningmama
            </h2>
            <a
              href="https://instagram.com/hellomorningmama"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline inline-flex items-center gap-1"
              style={{ color: "#2d6a4f" }}
            >
              Ikuti kami di Instagram →
            </a>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {galleryImages.map((src, i) => (
              <a
                key={i}
                href="https://instagram.com/hellomorningmama"
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square overflow-hidden rounded-2xl group block"
              >
                <Image
                  src={src}
                  alt={`Morning Mama gallery ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 text-2xl transition-opacity duration-300">📷</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontak" className="py-24 px-6" style={{ backgroundColor: "#1a2e1a" }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-4" style={{ color: "#52b788" }}>
              Kontak & Lokasi
            </p>
            <h2 className="text-4xl font-bold mb-6 text-white" style={{ fontFamily: "Georgia, serif" }}>
              Kunjungi Kami
            </h2>
            <p className="text-white/60 text-sm leading-7 mb-8">
              Temukan Morning Mama di Banda Aceh. Kami terbuka setiap hari untuk menyambut Anda dengan senyum hangat dan kopi terbaik.
            </p>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <span className="text-xl mt-0.5">📍</span>
                <div>
                  <p className="text-sm font-semibold text-white">Lokasi</p>
                  <p className="text-sm text-white/55 mt-0.5">
                    Morning Mama, Lamlagang
                    <br />
                    <a
                      href="https://maps.app.goo.gl/YQogx72EWJKjLx4D6"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                      style={{ color: "#52b788" }}
                    >
                      Jl. Sultan Malikul Saleh No.47AB, Lam Lagang, Kec. Banda Raya, Kota Banda Aceh, Aceh 23239
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-xl mt-0.5">🕐</span>
                <div>
                  <p className="text-sm font-semibold text-white">Jam Buka</p>
                  <p className="text-sm text-white/55 mt-0.5">Setiap hari 08.30 - 23.30</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-xl mt-0.5">📦</span>
                <div>
                  <p className="text-sm font-semibold text-white">Order Online</p>
                  <p className="text-sm text-white/55 mt-0.5">Tersedia di GrabFood & GoFood</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-xl mt-0.5">📱</span>
                <div>
                  <p className="text-sm font-semibold text-white">Instagram</p>
                  <a
                    href="https://instagram.com/hellomorningmama"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline mt-0.5 block"
                    style={{ color: "#52b788" }}
                  >
                    @hellomorningmama
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden relative aspect-square shadow-2xl">
            <Image
              src="/images/gallery-5.jpeg"
              alt="Morning Mama"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(26,46,26,0.6) 0%, transparent 60%)" }} />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-white font-semibold text-lg" style={{ fontFamily: "Georgia, serif" }}>Morning Mama</p>
              <p className="text-white/60 text-sm">Cafe · Banda Aceh</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6" style={{ backgroundColor: "#0f1f0f" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#2d6a4f" }}>M</div>
            <span className="text-sm font-semibold text-white/80">Morning Mama</span>
          </div>
          <p className="text-xs text-white/40">© {new Date().getFullYear()} Morning Mama Cafe · Banda Aceh</p>
          <a
            href="https://instagram.com/hellomorningmama"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:underline transition-colors"
            style={{ color: "#52b788" }}
          >
            @hellomorningmama
          </a>
        </div>
      </footer>

      {/* Order Popup Modal */}
      {showOrderPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onClick={() => setShowOrderPopup(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold" style={{ color: "#1a2e1a", fontFamily: "Georgia, serif" }}>Pesan Online</h3>
              <button
                onClick={() => setShowOrderPopup(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <a
                href="https://gofood.link/a/H9PvdDN"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 rounded-xl text-center font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#00AA13" }}
              >
                Pesan via GoFood
              </a>
              <a
                href="https://grab.onelink.me/2695613898"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 rounded-xl text-center font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#00B14F" }}
              >
                Pesan via GrabFood
              </a>
            </div>
            <p className="text-xs text-center mt-4" style={{ color: "#6a7a6a" }}>
              Pilih platform favorit Anda untuk memesan
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
