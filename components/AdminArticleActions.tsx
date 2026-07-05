"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/components/ConfirmProvider';
import toast from 'react-hot-toast';

export default function AdminArticleActions({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const confirm = useConfirm();

  async function publish() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: true }),
      });
      if (!res.ok) throw new Error('Publish failed');
      router.refresh();
    } catch (e: any) {
    toast.error(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  async function approveAndPublish() {
    const ok = await confirm('Approve and publish this draft?');
    if (!ok) return;
    const comment = prompt('Optional comment for the approval/review:') || '';
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/drafts/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      });
      if (!res.ok) throw new Error('Approve failed');
      // navigate to edit page for the published article
      router.push(`/admin/articles/${id}/edit`);
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  async function unpublish() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: false }),
      });
      if (!res.ok) throw new Error('Unpublish failed');
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    const ok = await confirm('Delete this article? This cannot be undone.');
    if (!ok) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error('Delete failed');
      router.push('/admin/articles');
    } catch (e: any) {
      toast.error(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      {published ? (
        <button className="px-2 py-1 border rounded" onClick={unpublish} disabled={loading}>Unpublish</button>
      ) : (
        <>
          <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={publish} disabled={loading}>Publish</button>
          <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={approveAndPublish} disabled={loading}>Approve & Publish</button>
        </>
      )}
      <button className="px-2 py-1 border rounded text-red-600" onClick={remove} disabled={loading}>Delete</button>
    </div>
  );
}
