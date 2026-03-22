import { useEffect, useState } from "react";

import Tag from "./Tag";
import ConfirmModal from "./ConfirmModal";
import SuccessModal from "./SuccessModal";
import ErrorModal from "./ErrorModal";
import { getAdminToken, isAdminUnlocked } from "../utils/admin";

export default function PostModal({ post, leaving, onClose }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!post) return null;

  const formatRange = (post) => {
    const formatMDY = (value) => {
      if (!value) return "";
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return value;
      return d.toLocaleDateString("en-US");
    };

    const start = post?.date_from;
    const end = post?.date_to;
    if (start && end) {
      const s = formatMDY(start);
      const e = formatMDY(end);
      if (s && e && s !== e) return `${s} - ${e}`;
      return s || e;
    }
    return formatMDY(start) || "";
  };

  // Helper function to get featured image
  const getFeaturedImage = (post) => {
    if (post.featured_image) {
      // If it's a directory, find the first image
      if (!post.featured_image.includes('.')) {
        // This is a directory path, we'll need to scan it or use a default
        return null;
      }
      return post.featured_image;
    }
    return null;
  };

  const handleEdit = () => {
    window.location.href = `/edit/${post.id}`;
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      const token = document.querySelector('meta[name="csrf-token"]')?.content;
      const adminToken = getAdminToken();
      const response = await fetch(`/blogs/${post.id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { "X-CSRF-TOKEN": token } : {}),
          ...(adminToken ? { "X-ADMIN-TOKEN": adminToken } : {}),
        },
      });

      if (!response.ok) {
        setDeleteErrorMessage("Failed to delete blog post.");
        setShowDeleteError(true);
        return;
      }

      // Close the post modal first, then redirect and show success modal on homepage
      onClose();
      sessionStorage.setItem('deleteSuccess', 'true');
      window.location.href = "/blog";
    } catch (err) {
      console.error("Error deleting blog:", err);
      setDeleteErrorMessage("Error deleting blog post.");
      setShowDeleteError(true);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <div
          className="absolute inset-0 bg-black/40 anim-fade-in"
          style={{ opacity: leaving ? 0 : 1, transition: "opacity 0.3s ease" }}
          onClick={onClose}
        />

        <div
          className={`relative z-10 bg-[#FFFDF8] w-full max-w-2xl h-full overflow-y-auto shadow-2xl flex flex-col ${
            leaving ? "drawer-exit" : "drawer-enter"
          }`}
        >
        <div className="sticky top-0 bg-[#FFFDF8] border-b border-amber-100 px-6 py-4 flex items-center justify-between z-10">
          <span className="font-serif text-lg text-stone-800">Blog Post</span>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center justify-center text-stone-500 font-bold cursor-pointer btn-bounce"
            style={{ fontSize: 16, border: "none" }}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 px-6 py-6">
          <div className="overflow-hidden rounded-2xl border border-amber-100 shadow-sm bg-white">
            {getFeaturedImage(post) && (
              <img src={getFeaturedImage(post)} alt={post.title} className="w-full h-52 object-cover object-center" />
            )}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Tag label={post.task} />
                <span className="text-xs text-stone-400">
                  {post.week} · {formatRange(post)} · {post.read_time}
                </span>
              </div>
              <h1 className="font-serif text-2xl text-stone-800 mb-4 leading-snug">{post.title}</h1>
              <div className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-0.5 mt-6 pt-4 border-t border-amber-100">
                {isAdminUnlocked() && (
                  <>
                    <button
                      onClick={handleEdit}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete blog post?"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ErrorModal
        isOpen={showDeleteError}
        onClose={() => setShowDeleteError(false)}
        message={deleteErrorMessage}
      />
    </>
  );
}
