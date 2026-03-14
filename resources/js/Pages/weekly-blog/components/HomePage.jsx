import { BLOG_POSTS } from "../data";
import { useEffect, useMemo, useState } from "react";
import Reveal from "./Reveal";
import Tag from "./Tag";
import TypewriterText from "./TypewriterText";

/* ── HomePage ── */
export default function HomePage({ scrollToSection }) {
  const [latestPost, setLatestPost] = useState(null);

  useEffect(() => {
    fetch("/blogs")
      .then((res) => res.json())
      .then((data) => {
        const posts = Array.isArray(data) ? data : [];
        if (posts.length === 0) return;

        const toTime = (v) => {
          if (!v) return null;
          const d = new Date(v);
          return Number.isNaN(d.getTime()) ? null : d.getTime();
        };

        const sorted = [...posts].sort((a, b) => {
          const at = toTime(a?.created_at) ?? toTime(a?.date) ?? 0;
          const bt = toTime(b?.created_at) ?? toTime(b?.date) ?? 0;
          if (bt !== at) return bt - at;
          const ai = Number(a?.id) || 0;
          const bi = Number(b?.id) || 0;
          return bi - ai;
        });

        setLatestPost(sorted[0] || null);
      })
      .catch(() => {
        setLatestPost(null);
      });
  }, []);

  const featured = useMemo(() => {
    if (latestPost) return latestPost;
    return BLOG_POSTS[0];
  }, [latestPost]);

  const getFeaturedImage = (post) => {
    if (!post) return "/images/placeholder.jpg";
    if (post.featured_image) return post.featured_image;
    return post.img || "/images/placeholder.jpg";
  };

  const getExcerpt = (post) => {
    const text = (post?.content || post?.excerpt || "").toString().trim();
    if (!text) return "";
    const words = text.split(/\s+/).filter(Boolean);
    const preview = words.slice(0, 26).join(" ");
    return words.length > 26 ? `${preview}...` : preview;
  };

  const formatDate = (post) => {
    const raw = post?.date;
    if (!raw) return "";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    return d.toLocaleDateString();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="mb-14 text-center">
        <div
          className="inline-block bg-amber-100 text-amber-700 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4 anim-fade-down"
          style={{ animationDelay: "100ms" }}
        >
          Wendee Diane's Weekly Blog
        </div>
        <h1
          className="font-serif text-4xl md:text-5xl text-stone-800 leading-tight mb-3 anim-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          Good code, good coffee,
          <br />
          <span className="text-amber-400 italic">
            <TypewriterText text="great links." delay={900} />
          </span>
        </h1>
        <p
          className="text-stone-500 text-base max-w-md mx-auto leading-relaxed anim-fade-up"
          style={{ animationDelay: "400ms" }}
        >
          Weekly reflections, lab docs, and tech reads from an IT student navigating the beautiful mess of Computer Science.
        </p>
        <div
          className="flex items-center justify-center gap-3 mt-6 anim-fade-up"
          style={{ animationDelay: "550ms" }}
        >
          <button
            onClick={() => scrollToSection("blog")}
            className="bg-amber-400 hover:bg-amber-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow btn-bounce"
          >
            Read the Blog
          </button>
          <button
            onClick={() => scrollToSection("documentation")}
            className="border border-amber-300 text-amber-700 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-amber-50 btn-bounce"
            style={{ transition: "background 0.15s" }}
          >
            View Docs
          </button>
        </div>
      </div>

      {/* Featured */}
      <Reveal delay={0}>
        <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Featured this week</p>
        <div className="rounded-2xl overflow-hidden border border-amber-100 shadow-sm flex flex-col md:flex-row bg-white hover-lift hover-img">
          <div className="w-full md:w-64 h-48 md:h-auto flex-shrink-0 overflow-hidden">
            <img src={getFeaturedImage(featured)} alt={featured?.title || "Featured"} className="w-full h-full object-cover" />
          </div>
          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag label={featured?.task || featured?.tag} color={featured?.tagColor} />
                <span className="text-xs text-stone-400">
                  {featured?.week} · {formatDate(featured)}
                </span>
              </div>
              <h2 className="font-serif text-2xl text-stone-800 mb-2 leading-snug">{featured?.title}</h2>
              <p className="text-stone-500 text-sm leading-relaxed">{getExcerpt(featured)}</p>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs text-stone-400">{featured?.read_time || featured?.readTime} read</span>
              <button
                onClick={() => scrollToSection("blog")}
                className="text-amber-500 hover:text-amber-700 text-sm font-semibold bg-transparent border-none cursor-pointer btn-bounce"
                style={{ transition: "color 0.15s" }}
              >
                Read more →
              </button>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Recent */}
      <div className="mt-10">
        <Reveal delay={0}>
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Recent posts</p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {BLOG_POSTS.slice(1).map((post, i) => (
            <Reveal key={post.id} delay={i * 100}>
              <div
                className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden cursor-pointer hover-lift hover-img h-full"
                onClick={() => scrollToSection("blog")}
              >
                <div className="overflow-hidden">
                  <img src={post.img} alt={post.title} className="w-full h-36 object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag label={post.tag} color={post.tagColor} />
                  </div>
                  <h3 className="font-serif text-base text-stone-800 leading-snug mb-1">{post.title}</h3>
                  <p className="text-xs text-stone-400">
                    {post.week} · {post.readTime} read
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
