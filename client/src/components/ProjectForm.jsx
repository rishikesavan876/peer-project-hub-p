import { useState } from 'react';

export default function ProjectForm({ initialData = {}, onSubmit, submitting, submitLabel, error }) {
  const [form, setForm] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    tags: Array.isArray(initialData.tags)
      ? initialData.tags.join(', ')
      : initialData.tags || '',
    githubRepo: initialData.githubRepo || '',
    liveDemo: initialData.liveDemo || '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
      <div>
        <label htmlFor="title" className={labelClass}>
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={120}
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Real-time Chat App with Socket.io"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          required
          maxLength={3000}
          rows={6}
          value={form.description}
          onChange={handleChange}
          placeholder="What does this project do? What tech did you use? What did you learn?"
          className={`${inputClass} resize-y`}
        />
        <p className="mt-1 text-xs text-slate-400">{form.description.length}/3000</p>
      </div>

      <div>
        <label htmlFor="tags" className={labelClass}>
          Tags <span className="text-slate-400 text-xs">(comma separated)</span>
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          value={form.tags}
          onChange={handleChange}
          placeholder="React, MongoDB, Node.js, TailwindCSS"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="githubRepo" className={labelClass}>
          GitHub Repo Link <span className="text-red-500">*</span>
        </label>
        <input
          id="githubRepo"
          name="githubRepo"
          type="url"
          required
          value={form.githubRepo}
          onChange={handleChange}
          placeholder="https://github.com/username/repo"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="liveDemo" className={labelClass}>
          Live Demo Link <span className="text-slate-400 text-xs">(optional)</span>
        </label>
        <input
          id="liveDemo"
          name="liveDemo"
          type="url"
          value={form.liveDemo}
          onChange={handleChange}
          placeholder="https://your-demo.vercel.app"
          className={inputClass}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50 transition-colors"
      >
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
