import { BLOG_POSTS } from "../data";
import { useState, useEffect, useMemo } from "react";

import Reveal from "./Reveal";
import Tag from "./Tag";
import PostModal from "./PostModal";
import SuccessModal from "./SuccessModal";
import TypewriterText from "./TypewriterText";

/* ── HomePage ── */
export default function HomePage({ scrollToSection }) {
  const [posts, setPosts] = useState([]);
  const [latestPost, setLatestPost] = useState(null);
  const [selected, setSelected] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

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

        setPosts(sorted);
        setLatestPost(sorted[0]);
      })
      .catch(() => {
        setLatestPost(null);
        setPosts([]);
      });

    // Check for delete success flag in sessionStorage
    const deleteSuccess = sessionStorage.getItem('deleteSuccess');
    if (deleteSuccess === 'true') {
      setShowDeleteSuccess(true);
      // Clear the flag immediately
      sessionStorage.removeItem('deleteSuccess');
    }
  }, []);

  const featured = useMemo(() => {
    if (latestPost) return latestPost;
    return BLOG_POSTS[0];
  }, [latestPost]);

  const recentPosts = useMemo(() => {
    const source = posts.length > 0 ? posts : BLOG_POSTS;
    return source.slice(1, 4);
  }, [posts]);

  const getFeaturedImage = (post) => {
    if (!post) return null;
    if (post.featured_image) return post.featured_image;
    return post.img || null;
  };

  const getExcerpt = (post) => {
    const text = (post?.content || post?.excerpt || "").toString().trim();
    if (!text) return "";
    const words = text.split(/\s+/).filter(Boolean);
    const preview = words.slice(0, 26).join(" ");
    return words.length > 26 ? `${preview}...` : preview;
  };

  const openPost = (post) => setSelected(post);
  const closePost = () => {
    setLeaving(true);
    setTimeout(() => {
      setSelected(null);
      setLeaving(false);
    }, 280);
  };

  const formatDate = (post) => {
    const formatMDY = (value) => {
      if (!value) return "";
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return value;
      return d.toLocaleDateString("en-US");
    };

    const start = post?.date_from || post?.start_date || post?.startDate || post?.dateStart;
    const end = post?.date_to || post?.end_date || post?.endDate || post?.dateEnd;

    if (start && end) {
      const s = formatMDY(start);
      const e = formatMDY(end);
      if (s && e && s !== e) return `${s} - ${e}`;
      return s || e;
    }

    const single = post?.date;
    return formatMDY(single);
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
          Good code, good logic,
          <br />
          <span className="text-amber-400 italic">
            <TypewriterText text="great systems." delay={900} />
          </span>
        </h1>
        <p
          className="text-stone-500 text-base max-w-md mx-auto leading-relaxed anim-fade-up"
          style={{ animationDelay: "400ms" }}
        >
          Weekly reflections, development logs, and experience from an IT student building and improving modern systems.
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
        <div
          className="rounded-2xl overflow-hidden border border-amber-100 shadow-sm flex flex-col md:flex-row bg-white hover-lift hover-img cursor-pointer"
          onClick={() => openPost(featured)}
        >
          {getFeaturedImage(featured) && (
            <div className="w-full md:w-64 h-48 md:h-auto flex-shrink-0 overflow-hidden">
              <img src={getFeaturedImage(featured)} alt={featured?.title || "Featured"} className="w-full h-full object-cover" />
            </div>
          )}
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
              <span className="text-xs text-stone-400">{featured?.read_time || featured?.readTime}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openPost(featured);
                }}
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
          {recentPosts.map((post, i) => (
            <Reveal key={post.id} delay={i * 100}>
              <div
                className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden cursor-pointer hover-lift hover-img h-full"
                onClick={() => openPost(post)}
              >
                {(post.featured_image || post.img) && (
                  <div className="overflow-hidden">
                    <img src={post.featured_image || post.img} alt={post.title} className="w-full h-36 object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag label={post.task || post.tag} color={post.tagColor} />
                  </div>
                  <h3 className="font-serif text-base text-stone-800 leading-snug mb-1">{post.title}</h3>
                  <p className="text-xs text-stone-400">
                    {post.week} · {post.read_time || post.readTime}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      {/* Post Modal */}
      {selected && (
        <PostModal post={selected} leaving={leaving} onClose={closePost} />
      )}

      {/* Delete Success Modal */}
      <SuccessModal
        isOpen={showDeleteSuccess}
        onClose={() => setShowDeleteSuccess(false)}
        message="Blog post deleted successfully!"
      />
    </div>
  );
}
