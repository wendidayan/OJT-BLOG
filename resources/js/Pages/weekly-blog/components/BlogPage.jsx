import { useState, useEffect } from "react";

import Reveal from "./Reveal";
import Tag from "./Tag";
import PostModal from "./PostModal";

/* ── BlogPage ── */
export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch blog posts from API
  useEffect(() => {
    fetch('/blogs')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch blogs:', err);
        setLoading(false);
      });
  }, []);

  // Helper function to get first 22 words
  const getContentPreview = (content) => {
    if (!content) return '';
    const words = content.split(' ').slice(0, 22);
    return words.join(' ') + (content.split(' ').length > 22 ? '...' : '');
  };

  // Helper function to get featured image
  const getFeaturedImage = (post) => {
    if (post.featured_image) {
      // If it's a directory, find the first image
      if (!post.featured_image.includes('.')) {
        // This is a directory path, we'll need to scan it or use a default
        return '/images/placeholder.jpg'; // You might want to create a placeholder
      }
      return post.featured_image;
    }
    return '/images/placeholder.jpg'; // Default placeholder
  };

  const openPost = (post) => setSelected(post);
  const closePost = () => {
    setLeaving(true);
    setTimeout(() => {
      setSelected(null);
      setLeaving(false);
    }, 280);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center text-stone-400">Loading blog posts...</div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Reveal>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-serif text-3xl text-stone-800">The Blog</h2>
            <button
              onClick={() => window.location.href = '/create'}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-1.5 px-3 rounded-full text-sm btn-bounce shadow"
              style={{ transition: 'transform 0.15s ease, background-color 0.15s ease' }}
            >
              +
            </button>
          </div>
          <p className="text-stone-400 text-sm mb-8">Weekly reflections on IT student life, labs, and learning.</p>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={i * 90}>
              <div
                className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden cursor-pointer hover-lift hover-img flex flex-col h-full"
                onClick={() => openPost(post)}
              >
                <div className="overflow-hidden">
                  <img src={getFeaturedImage(post)} alt={post.title} className="w-full h-44 object-cover object-center" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag label={post.task} />
                    <span className="text-xs text-stone-400">
                      {post.week} · {new Date(post.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl text-stone-800 leading-snug mb-2">{post.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed flex-1">{getContentPreview(post.content)}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-stone-400">{post.read_time} read</span>
                    <button
                      className="text-amber-500 text-sm font-semibold bg-transparent border-none cursor-pointer btn-bounce"
                      style={{ transition: "transform 0.15s ease" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openPost(post);
                      }}
                    >
                      Read →
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        {posts.length === 0 && !loading && (
          <div className="text-center text-stone-400 py-10">
            No blog posts yet. Click the + button to create one!
          </div>
        )}
      </div>

      {selected && <PostModal post={selected} leaving={leaving} onClose={closePost} />}
    </>
  );
}
