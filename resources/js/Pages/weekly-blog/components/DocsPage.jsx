import { useState, useEffect } from "react";

import Reveal from "./Reveal";
import Tag from "./Tag";

/* ── DocsPage ── */
export default function DocsPage() {
  const [docs, setDocs] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [gallery, setGallery] = useState(null);
  const [hoveredDocId, setHoveredDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const formatRange = (doc) => {
    const formatMDY = (value) => {
      if (!value) return "";
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return value;
      return d.toLocaleDateString("en-US");
    };

    const start = doc?.date_from;
    const end = doc?.date_to;
    if (start && end) {
      const s = formatMDY(start);
      const e = formatMDY(end);
      if (s && e && s !== e) return `${s} - ${e}`;
      return s || e;
    }
    return formatMDY(start) || "";
  };

  // Fetch documentation from API
  useEffect(() => {
    fetch('/docs')
      .then(res => res.json())
      .then(data => {
        setDocs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch docs:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const openGallery = (doc) => setGallery(doc);
  const closeGallery = () => setGallery(null);

  useEffect(() => {
    const anyOpen = lightbox || gallery;
    const prev = document.body.style.overflow;
    if (anyOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = prev;
    }
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightbox, gallery]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center text-stone-400">Loading documentation...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Reveal>
        <h2 className="font-serif text-3xl text-stone-800 mb-1">Documentation</h2>
        <p className="text-stone-400 text-sm mb-8">
          OJT working photos, system updates, and documented outputs — week by week.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {docs.map((doc, i) => (
          <Reveal key={doc.id} delay={i * 110}>
            <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden hover-lift flex flex-col">
              <div className="p-3 border-b border-amber-50 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Tag label={doc.task} />
                  <span className="text-xs text-stone-400 whitespace-nowrap px-2.5 py-1 rounded-full bg-stone-50 border border-stone-200">
                    {doc.week} · {formatRange(doc)}
                  </span>
                </div>
              </div>
              {(() => {
                const images = [...(doc.documentation_images || [])];
                const count = images.length;
                const stackImages = images.slice(0, 3);

                // Adjust padding based on how many images are in the stack.
                const stackPaddingClass =
                  count <= 1
                    ? "p-3"
                    : count === 2
                    ? "p-4"
                    : count === 3
                    ? "p-5"
                    : count === 4
                    ? "p-6"
                    : "p-7";

                return (
              <div
                className="flex items-center justify-center"
                style={{ paddingTop: 16, paddingBottom: 24 }}
              >
                <div
                  className="relative w-full max-w-[20rem] h-64 sm:w-56 sm:h-64 md:w-64 md:h-72"
                  onMouseEnter={() => setHoveredDocId(doc.id)}
                  onMouseLeave={() => setHoveredDocId(null)}
                >
                  {stackImages.map((src, j) => (
                    (() => {
                      const isHovered = hoveredDocId === doc.id;
                      const totalImages = stackImages.length;

                      // Polaroid-style stack positioning (like the reference icon)
                      // Back card peeks out left/top, middle slightly offset, front more prominent.
                      const desktopPresets = [
                        { x: -12, y: 6, r: -10 },
                        { x: -4, y: 2, r: -3 },
                        { x: 6, y: -2, r: 6 },
                      ];
                      const mobilePresets = [
                        { x: -8, y: 5, r: -9 },
                        { x: -3, y: 2, r: -2 },
                        { x: 5, y: -1, r: 5 },
                      ];

                      const presets = isMobile ? mobilePresets : desktopPresets;
                      const preset = presets[j] || { x: 0, y: 0, r: 0 };

                      // Center the whole stack visually when fewer than 3 images
                      const centerAdjust = (3 - totalImages) * (isMobile ? 3 : 4);
                      const x = preset.x + centerAdjust;
                      const y = preset.y;
                      const rotate = preset.r;

                      const hoverScale = isHovered ? 1.03 : 1;
                      return (
                    <div
                      key={j}
                      className="absolute w-full h-full rounded-2xl cursor-pointer transition-transform"
                      style={{
                        top: `calc(50% + ${y}px)`,
                        left: `calc(50% + ${x}px)`,
                        zIndex: totalImages - j,
                        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${hoverScale})`,
                        transition: "transform 220ms ease, top 220ms ease, left 220ms ease",
                      }}
                      onClick={() => openGallery(doc)}
                    >
                      <div className="w-full h-full rounded-2xl bg-white p-1 shadow-md border border-stone-200">
                        <div className="w-full h-full rounded-lg overflow-hidden bg-stone-100">
                          <img
                            src={src}
                            alt={`Doc ${j + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 flex items-center justify-center transition-colors rounded-2xl">
                        <span className="opacity-100 sm:opacity-0 sm:hover:opacity-100 text-white text-xs font-semibold bg-black/40 px-2 py-1 rounded-full transition-opacity">
                          View all
                        </span>
                      </div>
                    </div>
                      );
                    })()
                  ))}
                </div>
              </div>
                );
              })()}
            </div>
          </Reveal>
        ))}
      </div>

      {docs.length === 0 && !loading && (
        <div className="text-center text-stone-400 py-10">
          No documentation available yet. Create a blog post with documentation images!
        </div>
      )}

      {/* Gallery */}
      {gallery && (
        <div
          className="fixed inset-0 bg-black/95 z-50 anim-fade-in overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onClick={closeGallery}
        >
          <button
            onClick={closeGallery}
            className="fixed top-4 right-4 z-[60] bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold shadow-lg border border-white/15 cursor-pointer btn-bounce pointer-events-auto"
            style={{ fontSize: 16, top: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
          >
            ✕
          </button>

          <div
            className="min-h-full w-full flex items-start justify-center px-4 pt-20 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-5xl lightbox-enter">
            <div className="p-2 sm:p-4">
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(auto-fit, minmax(${Math.max(
                    140,
                    (() => {
                      const totalImages = gallery.documentation_images ? gallery.documentation_images.length : 0;
                      return totalImages <= 3 ? 220 : totalImages <= 6 ? 170 : 140;
                    })()
                  )}px, 1fr))`,
                }}
              >
                {(gallery.documentation_images || []).map((src, j) => (
                  <div
                    key={j}
                    className="bg-black/0 rounded-2xl overflow-hidden hover-lift cursor-zoom-in"
                    onClick={() => setLightbox(src)}
                  >
                    <div className="w-full aspect-[4/3] overflow-hidden">
                      <img
                        src={src}
                        alt={`Doc ${j + 1}`}
                        className="w-full h-full object-cover anim-scale-in rounded-2xl"
                        style={{ animationDelay: `${220 + j * 90}ms` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/95 z-50 anim-fade-in overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="fixed top-4 right-4 z-[60] bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold shadow-lg border border-white/15 cursor-pointer btn-bounce pointer-events-auto"
            style={{ fontSize: 16, top: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
          >
            ✕
          </button>

          <div className="min-h-full w-full flex items-start justify-center px-4 pt-20 pb-10" onClick={(e) => e.stopPropagation()}>
            <div className="relative inline-block max-w-[90vw] lightbox-enter">
              <div className="rounded-2xl overflow-hidden shadow-2xl bg-black">
                <img src={lightbox} alt="Preview" className="block max-w-full max-h-[80vh] w-auto h-auto" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
