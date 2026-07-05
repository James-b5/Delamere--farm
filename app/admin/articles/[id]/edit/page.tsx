import { prisma } from '@/lib/prisma';
import ArticleEditor from '@/components/ArticleEditor';
import { safeQuery } from '@/lib/prismaSafe';

type Props = { params: { id: string } };

export default async function EditArticlePage({ params }: Props) {
  const id = params.id;
  const post = await safeQuery(() => prisma.blogPost.findUnique({ where: { id } }), null);
  if (!post) return <div>Not found</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Edit Article</h1>
      {/* @ts-ignore */}
      <ArticleEditor submitPath={`/api/admin/articles/${id}`} method="PATCH" initial={post} />
    </div>
  );
}
