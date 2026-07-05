import { prisma } from '@/lib/prisma';
import { safeQuery } from '@/lib/prismaSafe';

type Props = { params: { slug: string } };

export default async function ArticlePage({ params }: Props) {
  const post: any = await safeQuery(
    () => prisma.blogPost.findUnique({ where: { slug: params.slug } }),
    null
  );
  if (!post || !post.published) return <div>Not found</div>;

  return (
    <article className="prose lg:prose-xl">
      <h1>{post.title}</h1>
      <p className="text-gray-600">{post.excerpt}</p>
      {post.publishedBy ? (
        <div className="text-sm text-gray-500">Published by {post.publishedBy} • {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}</div>
      ) : null}
      <div dangerouslySetInnerHTML={{ __html: post.content || '' }} />
    </article>
  );
}
