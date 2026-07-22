"use client";

import { useState } from "react";
import Image from "next/image";

export default function MenuPreview() {
  const [activeMenu, setActiveMenu] = useState<"food" | "beverage" | null>(null);

  const menus = [
    {
      id: "food" as const,
      title: "Food Menu",
      description: "Daftar menu makanan lezat Morning Mama",
      src: "/images/food-menu.png",
      emoji: "🍳",
    },
    {
      id: "beverage" as const,
      title: "Beverage Menu",
      description: "Daftar menu minuman segar Morning Mama",
      src: "/images/beverage-menu.png",
      emoji: "☕",
    },
  ];

  return (
    <div className="mt-8 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: "#2c1810", fontFamily: "Georgia, serif" }}>
          Menu Digital
        </h2>
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-cream text-primary-light">
          Klik untuk memperbesar
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menus.map((menu) => (
          <div
            key={menu.id}
            onClick={() => setActiveMenu(menu.id)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white p-4 shadow-sm border border-cream/50 transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{menu.emoji}</span>
              <div>
                <h3 className="font-semibold text-sm" style={{ color: "#2c1810" }}>
                  {menu.title}
                </h3>
                <p className="text-xs" style={{ color: "#9a7a6a" }}>
                  {menu.description}
                </p>
              </div>
            </div>

            {/* Image Preview Container */}
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-cream/30 border border-cream/20">
              <Image
                src={menu.src}
                alt={menu.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10 flex items-center justify-center">
                <span className="opacity-0 scale-95 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 bg-white/90 text-[#2c1810] text-xs font-semibold px-4 py-2 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z"
                    />
                  </svg>
                  Lihat Detail
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Overlay */}
      {activeMenu && (
        <div
          onClick={() => setActiveMenu(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center max-w-4xl w-full max-h-[90vh]"
          >
            {/* Control buttons */}
            <div className="absolute -top-12 right-0 flex items-center gap-3">
              {/* Download Button */}
              <a
                href={menus.find((m) => m.id === activeMenu)?.src}
                download={`${activeMenu}-menu.png`}
                className="flex items-center justify-center p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-xs"
                title="Unduh Gambar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
              </a>

              {/* Close Button */}
              <button
                onClick={() => setActiveMenu(null)}
                className="flex items-center justify-center p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-xs"
                title="Tutup"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative w-full overflow-y-auto rounded-2xl bg-white shadow-2xl max-h-[80vh] flex justify-center p-2 border border-cream/20">
              <img
                src={menus.find((m) => m.id === activeMenu)?.src}
                alt={menus.find((m) => m.id === activeMenu)?.title}
                className="max-w-full h-auto max-h-[75vh] object-contain rounded-xl"
              />
            </div>
            
            <p className="text-white/80 text-sm mt-3 font-medium">
              {menus.find((m) => m.id === activeMenu)?.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
