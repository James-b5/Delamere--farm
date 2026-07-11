"use client";

import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authenticatedFetch } from "@/lib/fetch-helper";
import Link from "next/link";
import { ArrowLeft, Loader, ImagePlus, Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

async function parseErrorResponse(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await response.json().catch(() => null);
    if (body && typeof body === 'object') {
      if (typeof body.error === 'string' && body.error.trim()) return body.error;
      if (typeof body.message === 'string' && body.message.trim()) return body.message;
    }
    return JSON.stringify(body) || response.statusText;
  }
  const text = await response.text().catch(() => '');
  return text || `${response.status} ${response.statusText}`;
}

interface MediaItem {
  id: number;
  title?: string | null;
  description?: string | null;
  type: string;
  url: string;
  order?: number;
}

export default function ModeratorMediaPage() {
  const { user, isModerator, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState({ title: "", description: "", type: "IMAGE", file: null as File | null, order: "0" });
  const [editForm, setEditForm] = useState({ title: "", description: "", order: "0" });

  useEffect(() => {
    if (!authLoading && (!user || (!isModerator && !isAdmin))) {
      router.push("/login");
    }
  }, [authLoading, user, isModerator, isAdmin, router]);

  useEffect(() => {
    async function fetchMedia() {
      try {
        const res = await authenticatedFetch("/api/admin/media");
        if (res.ok) {
          const data = await res.json();
          setMediaItems(Array.isArray(data) ? data : []);
        } else {
          toast.error("Failed to load media");
        }
      } catch {
        toast.error("Error fetching media");
      } finally {
        setIsLoading(false);
      }
    }

    if (isModerator || isAdmin) {
      fetchMedia();
    }
  }, [user, isModerator, isAdmin]);

  const createMedia = async () => {
    try {
      if (!createForm.file) throw new Error("Please select a file");
      const formData = new FormData();
      formData.append("type", createForm.type);
      formData.append("title", createForm.title);
      formData.append("description", createForm.description);
      formData.append("order", createForm.order);
      formData.append("file", createForm.file);

      const res = await authenticatedFetch("/api/admin/media", {
        method: "POST",
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const message = await parseErrorResponse(res);
        throw new Error(message || "Failed to upload media");
      }

      const created = await res.json();
      setMediaItems((curr) => [created, ...curr]);
      setCreateForm({ title: "", description: "", type: "IMAGE", file: null, order: "0" });
      setShowCreateForm(false);
      toast.success("Media uploaded");
    } catch (error) {
      console.error('Media upload failed:', error);
      toast.error(error instanceof Error ? error.message : "Failed to upload media");
    }
  };

  const startEdit = (item: MediaItem) => {
    setEditingItemId(item.id);
    setEditForm({ title: item.title || "", description: item.description || "", order: String(item.order || 0) });
  };

  const saveEdit = async (itemId: number) => {
    try {
      const res = await authenticatedFetch("/api/admin/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId, title: editForm.title, description: editForm.description, order: Number(editForm.order) }),
      });
      if (!res.ok) throw new Error("Failed to update media");
      const updated = await res.json();
      setMediaItems((curr) => curr.map((item) => (item.id === itemId ? { ...item, ...updated } : item)));
      setEditingItemId(null);
      toast.success("Media updated");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to update media");
    }
  };

  const deleteMedia = async (itemId: number) => {
    try {
      const res = await authenticatedFetch(`/api/admin/media?id=${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete media");
      setMediaItems((curr) => curr.filter((item) => item.id !== itemId));
      toast.success("Media deleted");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to delete media");
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
              <h1 className="text-2xl font-bold text-gray-900">Media</h1>
            </div>
            <button type="button" onClick={() => setShowCreateForm((cur) => !cur)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <Plus className="h-4 w-4" /> {showCreateForm ? "Hide Form" : "Upload Media"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {showCreateForm ? (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 text-sm font-semibold text-blue-900">Upload media</div>
            <div className="grid gap-3 md:grid-cols-2">
              <input value={createForm.title} onChange={(e) => setCreateForm((cur) => ({ ...cur, title: e.target.value }))} className="rounded border px-3 py-2" placeholder="Title" />
              <select value={createForm.type} onChange={(e) => setCreateForm((cur) => ({ ...cur, type: e.target.value }))} className="rounded border px-3 py-2">
                <option value="IMAGE">IMAGE</option>
                <option value="VIDEO">VIDEO</option>
              </select>
              <input value={createForm.description} onChange={(e) => setCreateForm((cur) => ({ ...cur, description: e.target.value }))} className="rounded border px-3 py-2 md:col-span-2" placeholder="Description" />
              <input type="file" accept="image/*,video/*" onChange={(e) => setCreateForm((cur) => ({ ...cur, file: e.target.files?.[0] ?? null }))} className="rounded border px-3 py-2" />
              <input type="number" value={createForm.order} onChange={(e) => setCreateForm((cur) => ({ ...cur, order: e.target.value }))} className="rounded border px-3 py-2" placeholder="Order" />
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => void createMedia()} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
              <button type="button" onClick={() => { setShowCreateForm(false); setCreateForm({ title: "", description: "", type: "IMAGE", file: null, order: "0" }); }} className="rounded border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : mediaItems.length > 0 ? (
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Media</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mediaItems.map((item) => (
                  <Fragment key={item.id}>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <ImagePlus className="mr-2 h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{item.title || "Untitled"}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">{item.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => startEdit(item)} className="inline-flex items-center gap-1 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                            <Pencil className="h-4 w-4" /> Edit
                          </button>
                          <button type="button" onClick={() => void deleteMedia(item.id)} className="inline-flex items-center gap-1 rounded border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editingItemId === item.id ? (
                      <tr>
                        <td colSpan={3} className="bg-gray-50 px-6 py-4">
                          <div className="grid gap-3 md:grid-cols-3">
                            <input value={editForm.title} onChange={(e) => setEditForm((cur) => ({ ...cur, title: e.target.value }))} className="rounded border px-3 py-2" placeholder="Title" />
                            <input value={editForm.description} onChange={(e) => setEditForm((cur) => ({ ...cur, description: e.target.value }))} className="rounded border px-3 py-2" placeholder="Description" />
                            <input type="number" value={editForm.order} onChange={(e) => setEditForm((cur) => ({ ...cur, order: e.target.value }))} className="rounded border px-3 py-2" placeholder="Order" />
                            <div className="flex gap-2 md:col-span-3">
                              <button type="button" onClick={() => void saveEdit(item.id)} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
                              <button type="button" onClick={() => setEditingItemId(null)} className="rounded border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
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
            <ImagePlus className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">No media found</p>
          </div>
        )}
      </div>
    </div>
  );
}
