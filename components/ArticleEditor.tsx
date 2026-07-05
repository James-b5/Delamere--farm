"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import EditorWrapper from './EditorWrapper';
import { authenticatedFetch } from '@/lib/fetch-helper';

type ArticleEditorProps = {
  submitPath?: string;
  method?: "POST" | "PATCH";
  initial?: any;
};

export default function ArticleEditor({ submitPath = "/api/admin/articles", method = "POST", initial = null }: ArticleEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [media, setMedia] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || "");
      setExcerpt(initial.excerpt || "");
      setCategory(initial.categoryId || initial.category || "");
      setImageUrl(initial.coverImage || initial.imageUrl || "");
      setContent(initial.content || "");
      // initial.tags may be relational objects or string
      const initialTags = (initial.tags && Array.isArray(initial.tags)) ? initial.tags.map((t: any) => t.tag?.name || t.name || t) : (initial.tags || []);
      setSelectedTags(initialTags as string[]);
    }
  }, [initial]);

  useEffect(() => {
    async function loadMedia() {
      setLoadingMedia(true);
      try {
        const res = await fetch('/api/admin/media');
        if (res.ok) {
          const j = await res.json();
          setMedia(j);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoadingMedia(false);
      }
    }
    loadMedia();

    async function loadCategoriesAndTags() {
      try {
        const [cRes, tRes] = await Promise.all([fetch('/api/categories'), fetch('/api/tags')]);
        if (cRes.ok) setCategories(await cRes.json());
        if (tRes.ok) setTagSuggestions((await tRes.json()).map((t: any) => t.name));
      } catch (e) {
        // ignore
      }
    }
    loadCategoriesAndTags();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required");
    setSubmitting(true);
    try {
      const res = await authenticatedFetch(submitPath, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, excerpt, categoryId: category, category, imageUrl, content, tags: selectedTags }),
      });
      if (!res.ok) throw new Error("Save failed");
      const created = await res.json();
      toast.success(method === 'POST' ? "Article created" : "Article updated");

      // Redirect: if published, go to public article; otherwise go to admin articles list
      const isPublished = created.published === true;
      if (isPublished && created.slug) {
        router.push(`/articles/${created.slug}`);
      } else {
        // if submitPath indicates moderator, go back to dashboard
        if (submitPath.includes('/moderator')) router.push('/dashboard');
        else router.push('/admin/articles');
      }

    } catch (err: any) {
      toast.error(err?.message || "Failed to save article");
    } finally {
      setSubmitting(false);
    }
  }

      // Autosave draft every 8 seconds when content changes
  useEffect(() => {
    let timer: any;
    if (!initial && submitPath.includes('/moderator')) {
      // for new moderator drafts, autosave after content change
      timer = setTimeout(async () => {
          try {
          const res = await authenticatedFetch(submitPath, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, excerpt, categoryId: category, category, imageUrl, content, tags: selectedTags, published: false }) });
          if (res.ok) {
            const created = await res.json();
            // update router to edit page if created id available
            if (created?.id) router.replace(`/moderator/articles/${created.id}/edit`);
          }
        } catch (e) {
          // ignore autosave errors
        }
      }, 8000);
    }
    return () => clearTimeout(timer);
  }, [content, title, excerpt, selectedTags]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100 sm:p-8">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <label htmlFor="article-title" className="block text-sm font-semibold text-slate-700">Title</label>
        <input id="article-title" value={title} onChange={(e) => setTitle(e.target.value)} title="Article title" placeholder="Enter article title" className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <label htmlFor="article-excerpt" className="block text-sm font-semibold text-slate-700">Excerpt</label>
        <textarea id="article-excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} title="Article excerpt" placeholder="Short summary" className="mt-2 block min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <label htmlFor="article-content" className="block text-sm font-semibold text-slate-700">Content</label>
        <div id="article-content" className="mt-2 rounded-xl border border-slate-300 bg-white p-2 shadow-sm">
          <EditorWrapper value={content} onChange={setContent} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <label htmlFor="article-category" className="block text-sm font-semibold text-slate-700">Category</label>
          <select id="article-category" value={category} onChange={(e) => setCategory(e.target.value)} title="Article category" className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100">
            <option value="">Uncategorized</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <label htmlFor="article-image" className="block text-sm font-semibold text-slate-700">Image URL</label>
          <input id="article-image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} title="Cover image URL" placeholder="/images/... or https://..." className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <label className="block text-sm font-semibold text-slate-700">Tags</label>
        <div className="mt-2">
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(t => (
              <span key={t} className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                {t}
                <button type="button" onClick={() => setSelectedTags(selectedTags.filter(x => x !== t))} className="text-emerald-700 hover:text-red-600">×</button>
              </span>
            ))}
          </div>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const v = tagInput.trim().replace(/,$/, '');
                if (v && !selectedTags.includes(v)) setSelectedTags([...selectedTags, v]);
                setTagInput('');
              }
            }}
            list="tag-suggestions"
            placeholder="Type a tag and press Enter"
            title="Tag input"
            id="article-tag-input"
            className="mt-3 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          />
          <datalist id="tag-suggestions">
            {tagSuggestions.map(s => <option key={s} value={s} />)}
          </datalist>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <h4 className="text-sm font-semibold text-slate-700">Select Cover Image</h4>
        <div className="mt-2 flex items-center gap-2">
          <input id="article-image-2" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} title="Image URL" placeholder="Image URL or pick below" className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 max-h-44 overflow-auto pr-1">
          {loadingMedia ? (
            <div className="col-span-full text-sm text-slate-500">Loading media...</div>
          ) : media.length === 0 ? (
            <div className="col-span-full text-sm text-slate-500">No media available. Upload in Media Library.</div>
          ) : (
            media.map((m) => (
              <button key={m.id} type="button" onClick={() => setImageUrl(m.url)} className={`overflow-hidden rounded-xl border ${imageUrl === m.url ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200'} bg-white`}>
                {m.type === 'IMAGE' ? (
                  <img src={m.url} alt={m.title || ''} className="h-20 w-full object-cover" />
                ) : (
                  <video src={m.url} className="h-20 w-full object-cover" />
                )}
              </button>
            ))
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button type="submit" disabled={submitting} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400">
            {submitting ? "Saving..." : method === 'POST' ? 'Create Article' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
