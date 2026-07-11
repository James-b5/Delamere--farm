"use client";

import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authenticatedFetch } from "@/lib/fetch-helper";
import Link from "next/link";
import { ArrowLeft, Loader, FileText, Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface Article {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  published?: boolean;
  createdAt?: string;
}

export default function ModeratorArticlesPage() {
  const { user, isModerator, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({ title: "", excerpt: "", content: "", published: false });
  const [editForm, setEditForm] = useState({ title: "", excerpt: "", content: "", published: false });

  useEffect(() => {
    if (!authLoading && (!user || (!isModerator && !isAdmin))) {
      router.push("/login");
    }
  }, [authLoading, user, isModerator, isAdmin, router]);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await authenticatedFetch("/api/admin/articles");
        if (res.ok) {
          const data = await res.json();
          setArticles(Array.isArray(data) ? data : []);
        } else {
          toast.error("Failed to load articles");
        }
      } catch {
        toast.error("Error fetching articles");
      } finally {
        setIsLoading(false);
      }
    }

    if (isModerator || isAdmin) {
      fetchArticles();
    }
  }, [user, isModerator, isAdmin]);

  const createArticle = async () => {
    try {
      const res = await authenticatedFetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: createForm.title,
          excerpt: createForm.excerpt,
          content: createForm.content,
          published: createForm.published,
        }),
      });
      if (!res.ok) throw new Error("Failed to create article");
      const created = await res.json();
      setArticles((curr) => [created, ...curr]);
      setCreateForm({ title: "", excerpt: "", content: "", published: false });
      setShowCreateForm(false);
      toast.success("Article created");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to create article");
    }
  };

  const startEdit = (article: Article) => {
    setEditingArticleId(article.id);
    setEditForm({
      title: article.title,
      excerpt: article.excerpt || "",
      content: article.content || "",
      published: Boolean(article.published),
    });
  };

  const saveEdit = async (articleId: string) => {
    try {
      const res = await authenticatedFetch(`/api/admin/articles/${articleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          excerpt: editForm.excerpt,
          content: editForm.content,
          published: editForm.published,
        }),
      });
      if (!res.ok) throw new Error("Failed to update article");
      const updated = await res.json();
      setArticles((curr) => curr.map((item) => (item.id === articleId ? { ...item, ...updated } : item)));
      setEditingArticleId(null);
      toast.success("Article updated");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to update article");
    }
  };

  const deleteArticle = async (articleId: string) => {
    try {
      const res = await authenticatedFetch(`/api/admin/articles/${articleId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete article");
      setArticles((curr) => curr.filter((item) => item.id !== articleId));
      toast.success("Article deleted");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to delete article");
    }
  };

  if (authLoading || !user || (!isModerator && !isAdmin)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/moderator" className="mr-4 text-blue-600 hover:text-blue-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateForm((cur) => !cur)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> {showCreateForm ? "Hide Form" : "Add Article"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {showCreateForm ? (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 text-sm font-semibold text-blue-900">Create article</div>
            <div className="grid gap-3">
              <input value={createForm.title} onChange={(e) => setCreateForm((cur) => ({ ...cur, title: e.target.value }))} className="rounded border px-3 py-2" placeholder="Title" />
              <input value={createForm.excerpt} onChange={(e) => setCreateForm((cur) => ({ ...cur, excerpt: e.target.value }))} className="rounded border px-3 py-2" placeholder="Excerpt" />
              <textarea value={createForm.content} onChange={(e) => setCreateForm((cur) => ({ ...cur, content: e.target.value }))} className="min-h-32 rounded border px-3 py-2" placeholder="Content" />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={createForm.published} onChange={(e) => setCreateForm((cur) => ({ ...cur, published: e.target.checked }))} />
                Publish immediately
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => void createArticle()} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
              <button type="button" onClick={() => { setShowCreateForm(false); setCreateForm({ title: "", excerpt: "", content: "", published: false }); }} className="rounded border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : articles.length > 0 ? (
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <Fragment key={article.id}>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{article.title}</div>
                            <div className="text-sm text-gray-500">{article.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-sm font-medium ${article.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {article.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => startEdit(article)} className="inline-flex items-center gap-1 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                            <Pencil className="h-4 w-4" /> Edit
                          </button>
                          <button type="button" onClick={() => void deleteArticle(article.id)} className="inline-flex items-center gap-1 rounded border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editingArticleId === article.id ? (
                      <tr>
                        <td colSpan={3} className="bg-gray-50 px-6 py-4">
                          <div className="grid gap-3">
                            <input value={editForm.title} onChange={(e) => setEditForm((cur) => ({ ...cur, title: e.target.value }))} className="rounded border px-3 py-2" placeholder="Title" />
                            <input value={editForm.excerpt} onChange={(e) => setEditForm((cur) => ({ ...cur, excerpt: e.target.value }))} className="rounded border px-3 py-2" placeholder="Excerpt" />
                            <textarea value={editForm.content} onChange={(e) => setEditForm((cur) => ({ ...cur, content: e.target.value }))} className="min-h-32 rounded border px-3 py-2" placeholder="Content" />
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                              <input type="checkbox" checked={editForm.published} onChange={(e) => setEditForm((cur) => ({ ...cur, published: e.target.checked }))} />
                              Publish immediately
                            </label>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => void saveEdit(article.id)} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
                              <button type="button" onClick={() => setEditingArticleId(null)} className="rounded border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">No articles found</p>
          </div>
        )}
      </div>
    </div>
  );
}
