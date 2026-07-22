"use client";

import { useState } from "react";
import Image from "next/image";

export default function FullMenuSection() {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const fullMenus = [
    {
      id: "beverage",
      title: "Beverage Menu",
      description: "Daftar menu minuman segar & kopi premium Morning Mama",
      src: "/images/beverage-menu.png",
      emoji: "☕",
    },
    {
      id: "food",
      title: "Food Menu",
      description: "Daftar menu makanan lezat & hidangan utama Morning Mama",
      src: "/images/food-menu.png",
      emoji: "🍳",
    },
  ];

  return (
    <div className="mt-16 pt-12 border-t" style={{ borderColor: "rgba(45, 106, 79, 0.15)" }}>
      <div className="text-center mb-10">
        <h3 className="text-2xl font-bold mb-2" style={{ color: "#1a2e1a", fontFamily: "Georgia, serif" }}>
          Menu Lengkap
        </h3>
        <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: "#2d6a4f" }}>
          Klik pada menu untuk melihat resolusi penuh
        </p>
      </div>

      <div className="flex flex-col gap-10 max-w-2xl mx-auto">
        {fullMenus.map((menu) => (
          <div key={menu.id} className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: "rgba(26, 46, 26, 0.05)" }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{menu.emoji}</span>
              <div>
                <h4 className="font-bold text-base md:text-lg" style={{ color: "#1a2e1a" }}>{menu.title}</h4>
                <p className="text-xs" style={{ color: "#6a7a6a" }}>{menu.description}</p>
              </div>
            </div>

            {/* Responsive Image Preview Container */}
            <div 
              onClick={() => setActiveImage(menu.src)}
              className="relative cursor-pointer group overflow-hidden rounded-2xl border aspect-[3/4]"
              style={{ borderColor: "rgba(26, 46, 26, 0.05)", backgroundColor: "#fbfaf7" }}
            >
              <Image
                src={menu.src}
                alt={menu.title}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                priority
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <span className="opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 bg-white/95 text-[#1a2e1a] text-xs font-semibold px-4 py-2.5 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1.5">
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
                  Perbesar Gambar
                </span>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <a
                href={menu.src}
                download={`${menu.id}-menu.png`}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold text-white transition-all hover:opacity-90 shadow-xs"
                style={{ backgroundColor: "#2d6a4f" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
                Unduh Menu
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Zoom modal */}
      {activeImage && (
        <div 
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <button 
            onClick={() => setActiveImage(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-4xl max-h-[85vh] w-full flex justify-center bg-white rounded-3xl p-3 border overflow-y-auto cursor-default shadow-2xl"
            style={{ borderColor: "rgba(26, 46, 26, 0.05)" }}
          >
            <img 
              src={activeImage} 
              alt="Menu Lengkap" 
              className="max-w-full h-auto max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
