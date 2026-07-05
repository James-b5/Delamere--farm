import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import AdminArticleActions from '@/components/AdminArticleActions';
import { safeQuery } from '@/lib/prismaSafe';

export default async function AdminArticlesPage() {
  const posts: any[] = await safeQuery(
    () => prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } }),
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Articles</h1>
        <Link href="/admin/articles/new" className="px-3 py-2 bg-green-600 text-white rounded">New Article</Link>
      </div>

      <div className="grid gap-3">
        {posts.map((p: any) => (
          <div key={p.id} className="p-4 border rounded flex justify-between items-center">
            <div>
              <Link href={`/articles/${p.slug}`} className="text-lg font-medium">{p.title}</Link>
              <div className="text-sm text-gray-500">{p.excerpt}</div>
              {p.published && p.publishedBy ? (
                <div className="text-xs text-gray-500">Published by {p.publishedBy} • {p.publishedAt ? new Date(p.publishedAt).toLocaleString() : ''}</div>
              ) : null}
            </div>
            <div className="flex gap-2 items-center">
              <Link href={`/admin/articles/${p.id}/edit`} className="px-2 py-1 border rounded">Edit</Link>
              {/* Client component for publish/delete actions */}
              {/* @ts-ignore */}
              <AdminArticleActions id={p.id} published={Boolean(p.published)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
