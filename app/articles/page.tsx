import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { safeQuery } from '@/lib/prismaSafe';

export default async function ArticlesPage() {
  const posts: any[] = await safeQuery(
    () => prisma.blogPost.findMany({ where: { published: true }, orderBy: { publishedAt: 'desc' } }),
    []
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Articles</h1>
      <div className="grid gap-3">
        {posts.map((p: any) => (
          <Link key={p.id} href={`/articles/${p.slug}`} className="p-4 border rounded block">
            <h2 className="text-lg font-medium">{p.title}</h2>
            <p className="text-sm text-gray-500">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
