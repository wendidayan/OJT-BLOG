import { useState, useEffect, useRef } from "react";
import Reveal from "./components/Reveal";

export default function EditBlog() {
  // Get ID from URL path
  const pathParts = window.location.pathname.split('/');
  const id = pathParts[pathParts.length - 1];
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    task: "",
    week: "",
    date: "",
    read_time: "",
    featured_image_file: null,
    documentation_image_files: [],
  });
  const [existingFeaturedImage, setExistingFeaturedImage] = useState(null);
  const [existingDocumentationImages, setExistingDocumentationImages] = useState([]);
  const [removeFeaturedImage, setRemoveFeaturedImage] = useState(false);
  const [removedDocumentationImages, setRemovedDocumentationImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const dateInputRef = useRef(null);
  const [readTimeManuallySet, setReadTimeManuallySet] = useState(false);

  useEffect(() => {
    // Fetch blog data
    fetch(`/blogs/${id}`)
      .then(res => res.json())
      .then(data => {
        setExistingFeaturedImage(data.featured_image || null);
        setExistingDocumentationImages(Array.isArray(data.documentation_images) ? data.documentation_images : []);
        setRemoveFeaturedImage(false);
        setRemovedDocumentationImages([]);
        setFormData({
          title: data.title || "",
          content: data.content || "",
          task: data.task || "",
          week: data.week || "",
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : "",
          read_time: data.read_time || "",
          featured_image_file: null,
          documentation_image_files: [],
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch blog:', err);
        setError('Failed to load blog post');
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "read_time") {
      setReadTimeManuallySet(true);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (readTimeManuallySet) return;
    const text = (formData.content || "").trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const wpm = 200;
    const minutes = Math.max(1, Math.ceil(words / wpm));
    const computed = words === 0 ? "" : `${minutes} min read`;
    setFormData((prev) => (prev.read_time === computed ? prev : { ...prev, read_time: computed }));
  }, [formData.content, readTimeManuallySet]);

  const handleFeaturedImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Featured image selected:', file.name);
      setFormData((prev) => ({ ...prev, featured_image_file: file }));
      setRemoveFeaturedImage(false);
    }
  };

  const handleRemoveExistingFeatured = () => {
    setExistingFeaturedImage(null);
    setRemoveFeaturedImage(true);
  };

  const handleRemoveExistingDoc = (src) => {
    setExistingDocumentationImages((prev) => prev.filter((x) => x !== src));
    setRemovedDocumentationImages((prev) => (prev.includes(src) ? prev : [...prev, src]));
  };

  const handleDocImageChange = (index, file) => {
    const updated = [...formData.documentation_image_files];
    updated[index] = file;
    console.log('Documentation image selected at index', index, ':', file?.name);
    setFormData((prev) => ({ ...prev, documentation_image_files: updated }));
  };

  const addDocImageField = () => {
    setFormData((prev) => ({
      ...prev,
      documentation_image_files: [...prev.documentation_image_files, null],
    }));
  };

  const removeDocImageField = (index) => {
    const updated = formData.documentation_image_files.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, documentation_image_files: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();

    // Add method override for PUT
    formDataToSend.append('_method', 'PUT');

    if (removeFeaturedImage) {
      formDataToSend.append('remove_featured_image', '1');
    }

    if (removedDocumentationImages.length > 0) {
      removedDocumentationImages.forEach((src) => {
        formDataToSend.append('remove_documentation_images[]', src);
      });
    }

    // Append all text fields
    Object.keys(formData).forEach(key => {
      if (key !== 'featured_image' && key !== 'documentation_images' && key !== 'featured_image_file' && key !== 'documentation_image_files') {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Append featured image file if selected
    if (formData.featured_image_file) {
      console.log('Appending featured image:', formData.featured_image_file.name);
      formDataToSend.append('featured_image', formData.featured_image_file);
    }

    // Append documentation image files if selected
    if (formData.documentation_image_files && formData.documentation_image_files.length > 0) {
      formData.documentation_image_files.forEach((file, index) => {
        if (file) {
          console.log('Appending documentation image', index, ':', file.name);
          formDataToSend.append('documentation_images[]', file);
        }
      });
    }

    // Debug: Log all FormData entries
    console.log('FormData contents:');
    for (let pair of formDataToSend.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      const response = await fetch(`/blogs/${id}`, {
        method: "POST",
        headers: { "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') },
        body: formDataToSend,
      });
      if (response.ok) {
        alert("Blog updated successfully!");
        window.location.href = "/blog";
      } else {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        alert("Failed to update blog.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating blog.");
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/blog";
    }
  };

  const openDatePicker = () => {
    const el = dateInputRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      el.showPicker();
    } else {
      el.focus();
      el.click();
    }
  };

  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center text-stone-400">Loading blog post...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Reveal>
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="mt-1 w-9 h-9 rounded-full bg-stone-50 hover:bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600 cursor-pointer btn-bounce"
            title="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="font-serif text-3xl text-stone-800 mb-1">Edit Blog Post</h2>
            <p className="text-stone-400 text-sm mb-8">Update your blog post details below.</p>
          </div>
        </div>
      </Reveal>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Reveal>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </Reveal>

        <Reveal>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={8}
              required
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </Reveal>

        <Reveal>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Task</label>
            <input
              type="text"
              name="task"
              value={formData.task}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Week</label>
              <input
                type="text"
                name="week"
                value={formData.week}
                onChange={handleChange}
                placeholder="e.g., Week 12"
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Date</label>
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={openDatePicker}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-left flex items-center gap-2"
                >
                  <svg className="w-5 h-5 text-stone-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className={formData.date ? "text-stone-700 text-sm" : "text-transparent text-sm select-none"}>
                    {formData.date ? formatDate(formData.date) : "_"}
                  </span>
                </button>
                <input
                  ref={dateInputRef}
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="absolute left-0 top-0 w-px h-px opacity-0 pointer-events-none"
                  aria-label="Date"
                />
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Read Time</label>
              <input
                type="text"
                name="read_time"
                value={formData.read_time}
                onChange={handleChange}
                placeholder="e.g., 5 min read"
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Featured Image</label>
              {existingFeaturedImage && (
                <div className="mb-2 flex items-start gap-3">
                  <div className="relative">
                    <img
                      src={existingFeaturedImage}
                      alt="Current featured"
                      className="w-28 h-20 object-cover object-center rounded-lg border border-stone-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveExistingFeatured}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white text-xs flex items-center justify-center"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="text-xs text-stone-500 leading-relaxed pt-1">
                    Current featured image
                  </div>
                </div>
              )}
              <input
                type="file"
                name="featured_image"
                onChange={handleFeaturedImageChange}
                accept="image/*"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {formData.featured_image_file && (
                <p className="mt-1 text-xs text-stone-500">Selected: {formData.featured_image_file.name}</p>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Documentation Images</label>
            {existingDocumentationImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {existingDocumentationImages.map((src, idx) => (
                  <div key={idx} className="relative">
                    <div className="rounded-lg overflow-hidden border border-stone-200">
                      <img src={src} alt={`Current doc ${idx + 1}`} className="w-20 h-14 object-cover object-center" />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingDoc(src)}
                      className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white text-xs flex items-center justify-center"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            {formData.documentation_image_files.map((file, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="file"
                  onChange={(e) => handleDocImageChange(i, e.target.files[0])}
                  accept="image/*"
                  className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {file && (
                  <span className="flex items-center text-xs text-stone-500 px-2">
                    {file.name}
                  </span>
                )}
                {formData.documentation_image_files.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDocImageField(i)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addDocImageField}
              className="mt-2 px-4 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300"
            >
              + Add Image
            </button>
          </div>
        </Reveal>

        <Reveal>
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600"
            >
              Update
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-stone-200 text-stone-700 font-semibold rounded-lg hover:bg-stone-300"
            >
              Cancel
            </button>
          </div>
        </Reveal>
      </form>
    </div>
  );
}
