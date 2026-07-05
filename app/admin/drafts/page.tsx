import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import AdminArticleActions from '@/components/AdminArticleActions';
import { safeQuery } from '@/lib/prismaSafe';

export default async function AdminDraftsPage() {
  const drafts: any[] = await safeQuery(
    () => prisma.blogPost.findMany({ where: { published: false }, orderBy: { createdAt: 'desc' } }),
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Pending Drafts</h1>
      </div>

      <div className="grid gap-3">
        {drafts.map((p: any) => (
          <div key={p.id} className="p-4 border rounded flex justify-between items-center">
            <div>
              <Link href={`/admin/articles/${p.id}/edit`} className="text-lg font-medium">{p.title}</Link>
              <div className="text-sm text-gray-500">{p.excerpt}</div>
              <div className="text-xs text-gray-500">Created {p.createdAt ? new Date(p.createdAt).toLocaleString() : ''} {p.author ? ` • by ${p.author}` : ''}</div>
            </div>
            <div className="flex gap-2 items-center">
              {/* @ts-ignore */}
              <AdminArticleActions id={p.id} published={Boolean(p.published)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
