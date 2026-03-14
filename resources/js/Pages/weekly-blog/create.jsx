import { useState, useEffect, useRef } from "react";
import Reveal from "./components/Reveal";

export default function CreateBlog() {
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

  const dateInputRef = useRef(null);
  const [readTimeManuallySet, setReadTimeManuallySet] = useState(false);

  useEffect(() => {
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

  const handleDocImageChange = (index, file) => {
    const updated = [...formData.documentation_image_files];
    updated[index] = file;
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
      const response = await fetch("/blogs", {
        method: "POST",
        headers: { "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') },
        body: formDataToSend,
      });
      if (response.ok) {
        alert("Blog created successfully!");
        window.location.href = "/blog";
      } else {
        alert("Failed to create blog.");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating blog.");
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
              <input
                type="file"
                name="featured_image"
                onChange={(e) => setFormData(prev => ({ ...prev, featured_image_file: e.target.files[0] }))}
                accept="image/*"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Documentation Images</label>
            {formData.documentation_image_files.map((file, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="file"
                  onChange={(e) => handleDocImageChange(i, e.target.files[0])}
                  accept="image/*"
                  className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
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
  );
}
