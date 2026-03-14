import { useEffect, useState } from "react";

import { NAV_ITEMS } from "./data";
import { STYLES } from "./styles";
import AboutPage from "./components/AboutPage";
import BlogPage from "./components/BlogPage";
import DocsPage from "./components/DocsPage";
import HomePage from "./components/HomePage";
import Navbar from "./components/Navbar";

/* ── App ── */
export default function App() {
  const [active, setActive] = useState("Home");

  const scrollToSection = (id) => {
    const el = document.getElementById(id.toLowerCase());
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const match = NAV_ITEMS.find((n) => n.toLowerCase() === id);
            if (match) setActive(match);
          }
        });
      },
      { threshold: 0.25 }
    );
    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.toLowerCase());
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{STYLES}</style>
      <div className="min-h-screen bg-[#FFFDF8]" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <Navbar active={active} />
        <section id="home"          className="scroll-mt-16"><HomePage scrollToSection={scrollToSection} /></section>
        <section id="blog"          className="scroll-mt-16"><BlogPage /></section>
        <section id="documentation" className="scroll-mt-16"><DocsPage /></section>
        <section id="about"         className="scroll-mt-16"><AboutPage /></section>
        <footer
          className="border-t border-amber-100 mt-16 py-6 text-center text-xs text-stone-400 anim-fade-in"
          style={{ animationDelay: "200ms" }}
        >
          RDMS · An IT Student's Weekly Blog · {new Date().getFullYear()}
        </footer>
      </div>
    </>
  );
}
