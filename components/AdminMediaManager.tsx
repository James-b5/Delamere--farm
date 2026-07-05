"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { useConfirm } from '@/components/ConfirmProvider';

type MediaItem = {
  id: number;
  type: string;
  url: string;
  title?: string;
  description?: string;
  order: number;
};

export default function AdminMediaManager() {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("IMAGE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editOrder, setEditOrder] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const tempIdRef = React.useRef<number>(-1);
  const confirm = useConfirm();

  // Explicit role-based access control
  useEffect(() => {
    if (user && !isAdmin) {
      toast.error('Unauthorized: Admin access required');
    }
  }, [user, isAdmin]);

  async function load() {
    const res = await fetch('/api/admin/media');
    const data = await res.json();
    setItems(data);
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Only admins can upload media');
      return;
    }
    if (!file) { toast.error('Select a file'); return; }

    const fd = new FormData();
    fd.append('file', file as Blob, (file as File).name);
    fd.append('type', type);
    fd.append('title', title);
    fd.append('description', description);

    // Optimistic: show a preview entry immediately
    const tempId = tempIdRef.current--;
    const previewUrl = URL.createObjectURL(file as Blob);
    const tempItem: MediaItem = {
      id: tempId,
      type,
      url: previewUrl,
      title,
      description,
      order: 0,
    };
    setItems(prev => [tempItem, ...prev]);

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const postHeaders: Record<string, string> = {};
    if (token) postHeaders['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/admin/media', { method: 'POST', body: fd, headers: postHeaders });
    if (res.ok) {
      const created = await res.json();
      // Replace temp item with server item
      setItems(prev => prev.map(i => i.id === tempId ? created : i));
      setFile(null); setTitle(''); setDescription('');
      // Revoke preview URL
      URL.revokeObjectURL(previewUrl);
    } else {
      // Remove temp preview
      setItems(prev => prev.filter(i => i.id !== tempId));
      URL.revokeObjectURL(previewUrl);
      const err = await res.json().catch(()=>({ error: 'Upload failed' }));
      toast.error(err?.error || 'Upload failed');
    }
  }

  async function handleDelete(id: number) {
    if (!isAdmin) {
      toast.error('Only admins can delete media');
      return;
    }
    const ok = await confirm('Delete this media item?');
    if (!ok) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const delHeaders: Record<string, string> = {};
    if (token) delHeaders['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE', headers: delHeaders });
    if (res.ok) load(); else toast.error('Delete failed');
  }

  function startEdit(item: MediaItem) {
    setEditingId(item.id);
    setEditTitle(item.title ?? '');
    setEditDescription(item.description ?? '');
    setEditOrder(item.order ?? 0);
    setValidationErrors([]);
    setModalOpen(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setModalOpen(false);
  }

  async function saveEdit(id: number) {
    if (!isAdmin) {
      toast.error('Only admins can edit media');
      return;
    }
    const errors: string[] = [];
    if (!editTitle || editTitle.trim().length === 0) errors.push('Title is required');
    if (editTitle.length > 200) errors.push('Title must be 200 characters or fewer');
    if (editDescription.length > 1000) errors.push('Description must be 1000 characters or fewer');
    if (!Number.isFinite(editOrder) || editOrder < 0) errors.push('Order must be 0 or greater');
    if (errors.length) { setValidationErrors(errors); return; }

    // Optimistic update: apply changes locally, keep a copy to revert if needed
    let previous: MediaItem | null = null;
    setItems(prev => prev.map(i => {
      if (i.id === id) { previous = i; return { ...i, title: editTitle, description: editDescription, order: editOrder }; }
      return i;
    }));

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const patchHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) patchHeaders['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/admin/media', {
        method: 'PATCH',
        headers: patchHeaders,
        body: JSON.stringify({ id, title: editTitle, description: editDescription, order: editOrder }),
      });
      if (res.ok) {
        const updated = await res.json();
        setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
        setEditingId(null);
        setModalOpen(false);
        toast.success('Media updated successfully');
      } else {
        const err = await res.json();
        // revert
        if (previous) setItems(prev => prev.map(i => i.id === previous!.id ? previous! : i));
        toast.error(err?.error || 'Update failed');
      }
    } catch (err) {
      if (previous) setItems(prev => prev.map(i => i.id === previous!.id ? previous! : i));
      toast.error('Update failed');
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleUpload} className={`p-4 border rounded ${!isAdmin ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex gap-2">
          <label htmlFor="media-type" className="sr-only">Media type</label>
          <select id="media-type" value={type} onChange={e=>setType(e.target.value)} className="border p-2" aria-label="Media type" disabled={!isAdmin}>
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Video</option>
          </select>

          <label htmlFor="media-title" className="sr-only">Title</label>
          <input id="media-title" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} className="border p-2 flex-1" disabled={!isAdmin} />

          <label htmlFor="media-desc" className="sr-only">Description</label>
          <input id="media-desc" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} className="border p-2 flex-1" disabled={!isAdmin} />

          <label htmlFor="media-file" className="sr-only">Choose file</label>
          <input id="media-file" type="file" aria-label="Choose media file" accept="image/*,video/*" onChange={e=>setFile(e.target.files?.[0] ?? null)} disabled={!isAdmin} />

          <button className="btn bg-green-600 text-white px-4 py-2 disabled:opacity-50" type="submit" disabled={!isAdmin}>Upload</button>
        </div>
      </form>

      <div className="grid grid-cols-3 gap-4">
        {items.map(i => (
          <div key={i.id} className="border p-2">
            {i.type === 'IMAGE' ? (
              <img src={i.url} alt={i.title || ''} className="w-full h-48 object-cover" />
            ) : (
              <video src={i.url} controls className="w-full h-48 object-cover" />
            )}
            <div className="mt-2 flex justify-between items-center">
              <div>
                <div className="font-semibold">{i.title}</div>
                <div className="text-sm text-gray-600">{i.description}</div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={()=>startEdit(i)} 
                  className={`text-blue-600 ${!isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:underline'}`}
                  disabled={!isAdmin}
                >
                  Edit
                </button>
                <button 
                  onClick={()=>handleDelete(i.id)} 
                  className={`text-red-600 ${!isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:underline'}`}
                  disabled={!isAdmin}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {modalOpen && editingId !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-40" onClick={cancelEdit}></div>
          <div className="bg-white p-6 rounded shadow-lg z-10 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Edit Media</h3>
            {validationErrors.length > 0 && (
              <div className="mb-2 text-sm text-red-600">
                {validationErrors.map((err, idx) => <div key={idx}>{err}</div>)}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="edit-title" className="block text-sm">Title</label>
              <input id="edit-title" aria-label="Edit title" placeholder="Title" value={editTitle} onChange={e=>setEditTitle(e.target.value)} className="border p-2 w-full" />
              <label htmlFor="edit-description" className="block text-sm">Description</label>
              <textarea id="edit-description" aria-label="Edit description" placeholder="Description" value={editDescription} onChange={e=>setEditDescription(e.target.value)} className="border p-2 w-full" />
              <label htmlFor="edit-order" className="block text-sm">Order</label>
              <input id="edit-order" type="number" aria-label="Edit order" placeholder="0" value={editOrder} onChange={e=>setEditOrder(Number(e.target.value))} className="border p-2 w-28" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={cancelEdit} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
              <button onClick={()=>saveEdit(editingId)} className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
