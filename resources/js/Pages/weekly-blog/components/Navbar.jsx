import { useEffect, useState } from "react";

import { NAV_ITEMS } from "../data";

/* ── Navbar ── */
export default function Navbar({ active }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id.toLowerCase());
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  };

  return (
    <nav
      className="sticky top-0 z-50 bg-[#FFFDF8] border-b border-amber-100"
      style={{
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.07)" : "none",
        transition: "box-shadow 0.3s ease",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => scrollTo("home")}
          className="flex items-center gap-2 border-none bg-transparent cursor-pointer anim-fade-down btn-bounce"
          style={{ animationDelay: "0ms" }}
        >
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-white font-bold text-sm shadow pulse-amber">
            IT
          </div>
          <span className="font-serif text-lg text-stone-800 tracking-tight">RDMS</span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item, i) => (
            <button
              key={item}
              onClick={() => scrollTo(item)}
              className={`nav-link-line px-4 py-1.5 rounded-full text-sm font-medium transition-all anim-fade-down btn-bounce ${
                active === item
                  ? "bg-amber-400 text-white shadow"
                  : "text-stone-500 hover:text-stone-800 hover:bg-amber-50"
              }`}
              style={{ animationDelay: `${80 + i * 60}ms` }}
            >
              {item}
            </button>
          ))}
        </div>

        <button
          className="md:hidden text-stone-600 p-1 bg-transparent border-none cursor-pointer btn-bounce"
          onClick={() => setOpen(!open)}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{
              transition: "transform 0.25s ease",
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
            }}
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      <div
        className="md:hidden border-t border-amber-100 bg-[#FFFDF8] px-4 flex flex-col gap-1 overflow-hidden"
        style={{
          maxHeight: open ? "240px" : "0",
          paddingTop: open ? "8px" : "0",
          paddingBottom: open ? "8px" : "0",
          transition: "max-height 0.3s ease, padding 0.3s ease",
        }}
      >
        {NAV_ITEMS.map((item) => (
          <button
            key={item}
            onClick={() => scrollTo(item)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              active === item
                ? "bg-amber-400 text-white"
                : "text-stone-600 hover:bg-amber-50"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </nav>
  );
}
