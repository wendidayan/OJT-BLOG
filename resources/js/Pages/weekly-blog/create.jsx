import { useState, useEffect, useRef } from "react";
import Reveal from "./components/Reveal";
import SuccessModal from "./components/SuccessModal";
import ErrorModal from "./components/ErrorModal";
import { getAdminToken, isAdminUnlocked } from "./utils/admin";

export default function CreateBlog() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    task: "",
    week: "",
    date_from: "",
    date_to: "",
    read_time: "",
    featured_image_file: null,
    documentation_image_files: [],
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const dateFromInputRef = useRef(null);
  const dateToInputRef = useRef(null);
  const [readTimeManuallySet, setReadTimeManuallySet] = useState(false);

  useEffect(() => {
    if (!isAdminUnlocked()) {
      window.location.href = "/blog";
      return;
    }
    fetch("/blogs")
      .then((res) => res.json())
      .then((data) => {
        const posts = Array.isArray(data) ? data : [];

        const extractNumber = (value) => {
          const str = (value || "").toString();
          const match = str.match(/\d+/);
          return match ? parseInt(match[0], 10) : null;
        };

        const getNextMissing = (numbers) => {
          const set = new Set(numbers.filter((n) => Number.isInteger(n) && n > 0));
          let i = 1;
          while (set.has(i)) i += 1;
          return i;
        };

        const taskNums = posts.map((p) => extractNumber(p?.task)).filter((n) => n != null);
        const weekNums = posts.map((p) => extractNumber(p?.week)).filter((n) => n != null);

        const nextTask = getNextMissing(taskNums);
        const nextWeek = getNextMissing(weekNums);

        setFormData((prev) => ({
          ...prev,
          task: prev.task ? prev.task : `Task ${nextTask}`,
          week: prev.week ? prev.week : `Week ${nextWeek}`,
        }));
      })
      .catch(() => {
        setFormData((prev) => ({
          ...prev,
          task: prev.task ? prev.task : "Task 1",
          week: prev.week ? prev.week : "Week 1",
        }));
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFieldErrors((prev) => {
      if (!prev?.[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (name === "read_time") {
      setReadTimeManuallySet(true);
    }
    if (name === "date_from") {
      setFormData((prev) => {
        const next = { ...prev, date_from: value };
        if (next.date_to && value && next.date_to < value) {
          next.date_to = "";
        }
        return next;
      });
      return;
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
      setFormData((prev) => ({ ...prev, featured_image_file: file }));
      setFieldErrors((prev) => {
        if (!prev?.featured_image) return prev;
        const next = { ...prev };
        delete next.featured_image;
        return next;
      });
    }
  };

  const handleDocImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const currentCount = formData.documentation_image_files.length;
    const newCount = currentCount + files.length;
    if (newCount > 2) {
      setErrorMessage("You can only add up to 2 documentation images.");
      setShowError(true);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      documentation_image_files: [...prev.documentation_image_files, ...files],
    }));
    setFieldErrors((prev) => {
      if (!prev?.documentation_images) return prev;
      const next = { ...prev };
      delete next.documentation_images;
      return next;
    });
    // Reset the input so the same files can be selected again if needed
    e.target.value = '';
  };

  const removeDocImageFile = (index) => {
    const updated = formData.documentation_image_files.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, documentation_image_files: updated }));
  };

  const inputClass = (name) => {
    const base = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2";
    return fieldErrors?.[name]
      ? `${base} border-red-500 focus:ring-red-500`
      : `${base} border-stone-300 focus:ring-amber-500`;
  };

  const buttonInputClass = (name) => {
    const base = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white text-left flex items-center gap-2";
    return fieldErrors?.[name]
      ? `${base} border-red-500 focus:ring-red-500`
      : `${base} border-stone-300 focus:ring-amber-500`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    if (!isAdminUnlocked()) {
      setErrorMessage("Admin access required.");
      setShowError(true);
      return;
    }
    const formDataToSend = new FormData();

    // Append all text fields
    Object.keys(formData).forEach(key => {
      if (key !== 'featured_image' && key !== 'documentation_images' && key !== 'featured_image_file' && key !== 'documentation_image_files') {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Append featured image file if selected
    if (formData.featured_image_file) {
      formDataToSend.append('featured_image', formData.featured_image_file);
    }

    // Append documentation image files if selected
    if (formData.documentation_image_files && formData.documentation_image_files.length > 0) {
      formData.documentation_image_files.forEach(file => {
        if (file) {
          formDataToSend.append('documentation_images[]', file);
        }
      });
    }

    try {
      const adminToken = getAdminToken();
      const response = await fetch("/blogs", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
          ...(adminToken ? { "X-ADMIN-TOKEN": adminToken } : {}),
        },
        body: formDataToSend,
      });
      if (response.ok) {
        setShowSuccess(true);
        // Optionally reset form or redirect
      } else {
        let payload = null;
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }

        if (response.status === 422 && payload?.errors) {
          setFieldErrors(payload.errors);
          const firstKey = Object.keys(payload.errors)[0];
          const firstMsg = payload.errors?.[firstKey]?.[0] || "Please correct the highlighted fields.";
          setErrorMessage(firstMsg);
          setShowError(true);
          return;
        }

        console.error("Failed to create blog post");
        setErrorMessage(payload?.error || "Failed to create blog post.");
        setShowError(true);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Error creating blog.");
      setShowError(true);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/blog";
    }
  };

  const openDatePicker = (ref) => {
    const el = ref?.current;
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

  return (
  <>
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
            <h2 className="font-serif text-3xl text-stone-800 mb-1">Create New Blog</h2>
            <p className="text-stone-400 text-sm mb-8">Fill in the details below to publish a new entry.</p>
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
              className={inputClass('title')}
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
              className={inputClass('content')}
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
              className={inputClass('task')}
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
                className={inputClass('week')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Date From</label>
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => openDatePicker(dateFromInputRef)}
                  className={buttonInputClass('date_from')}
                >
                  <svg className="w-5 h-5 text-stone-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className={formData.date_from ? "text-stone-700 text-sm" : "text-transparent text-sm select-none"}>
                    {formData.date_from ? formatDate(formData.date_from) : "_"}
                  </span>
                </button>
                <input
                  ref={dateFromInputRef}
                  type="date"
                  name="date_from"
                  value={formData.date_from}
                  onChange={handleChange}
                  className="absolute left-0 top-0 w-px h-px opacity-0 pointer-events-none"
                  aria-label="Date From"
                />
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Date To</label>
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => openDatePicker(dateToInputRef)}
                  className={buttonInputClass('date_to')}
                >
                  <svg className="w-5 h-5 text-stone-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className={formData.date_to ? "text-stone-700 text-sm" : "text-transparent text-sm select-none"}>
                    {formData.date_to ? formatDate(formData.date_to) : "_"}
                  </span>
                </button>
                <input
                  ref={dateToInputRef}
                  type="date"
                  name="date_to"
                  value={formData.date_to}
                  onChange={handleChange}
                  min={formData.date_from || undefined}
                  className="absolute left-0 top-0 w-px h-px opacity-0 pointer-events-none"
                  aria-label="Date To"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Read Time</label>
              <input
                type="text"
                name="read_time"
                value={formData.read_time}
                onChange={handleChange}
                placeholder="e.g., 5 min read"
                className={inputClass('read_time')}
              />
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Featured Image</label>
              {!formData.featured_image_file && (
                <>
                  <input
                    type="file"
                    name="featured_image"
                    onChange={handleFeaturedImageChange}
                    accept="image/*"
                    className="hidden"
                    id="featured_image_input"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('featured_image_input').click()}
                    className={fieldErrors?.featured_image ? "px-4 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 border border-red-500" : "px-4 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300"}
                  >
                    + Choose Image
                  </button>
                </>
              )}
              {formData.featured_image_file && (
                <div className="mt-3">
                  <div className="relative inline-block">
                    <img
                      src={URL.createObjectURL(formData.featured_image_file)}
                      alt="Featured preview"
                      className="w-28 h-20 object-cover object-center rounded-lg border border-stone-200"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, featured_image_file: null }))}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white text-xs flex items-center justify-center"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Documentation Images</label>
              <input
                type="file"
                name="documentation_images"
                onChange={handleDocImagesChange}
                accept="image/*"
                multiple
                className="hidden"
                id="documentation_images_input"
              />
              {formData.documentation_image_files.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.documentation_image_files.map((file, i) => (
                    <div key={i} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Doc ${i + 1}`}
                        className="w-20 h-20 object-cover object-center rounded-lg border border-stone-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeDocImageFile(i)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white text-xs flex items-center justify-center"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {formData.documentation_image_files.length < 2 && (
                <button
                  type="button"
                  onClick={() => document.getElementById('documentation_images_input').click()}
                  className={fieldErrors?.documentation_images ? "px-4 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 border border-red-500" : "px-4 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300"}
                >
                  + Choose Images
                </button>
              )}
              {formData.documentation_image_files.length === 2 && (
                <div className="text-sm text-stone-500 italic">Maximum 2 images selected</div>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600"
            >
              Publish
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

    <SuccessModal
      isOpen={showSuccess}
      onClose={() => {
        setShowSuccess(false);
        window.location.href = "/blog";
      }}
      message="Blog post created successfully!"
    />

    <ErrorModal
      isOpen={showError}
      onClose={() => setShowError(false)}
      message={errorMessage}
    />
</>
);
}
