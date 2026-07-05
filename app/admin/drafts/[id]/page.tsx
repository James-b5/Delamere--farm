import { prisma } from '@/lib/prisma';
import AdminArticleActions from '@/components/AdminArticleActions';
import Link from 'next/link';
import { safeQuery } from '@/lib/prismaSafe';

type Props = { params: { id: string } };

export default async function DraftDetailPage({ params }: Props) {
  const post = await safeQuery(() => prisma.blogPost.findUnique({ where: { id: params.id } }), null);
  if (!post) return <div>Not found</div>;
  const reviews = await safeQuery(
    () => prisma.draftReview.findMany({ where: { postId: params.id }, orderBy: { createdAt: 'desc' } }),
    []
  );
  // enrich reviews with reviewer name when available
  const reviewsWithUser = await Promise.all(reviews.map(async (r: any) => {
    const user = await safeQuery(() => prisma.user.findUnique({ where: { id: r.reviewer } }), null);
    return { ...r, reviewerName: user?.name || user?.email || r.reviewer };
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">{post.title}</h1>
          <div className="text-sm text-gray-500">Created {post.createdAt?.toLocaleString()} {post.author ? ` • by ${post.author}` : ''}</div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/articles/${post.id}/edit`} className="px-3 py-2 border rounded">Edit</Link>
          {/* @ts-ignore */}
          <AdminArticleActions id={post.id} published={Boolean(post.published)} />
        </div>
      </div>

      <section>
        <h2 className="text-lg font-medium mb-2">Preview</h2>
        <div className="border p-4 rounded" dangerouslySetInnerHTML={{ __html: post.content || '' }} />
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Reviews</h2>
        <div className="space-y-2">
          {reviewsWithUser.map((r: any) => (
            <div key={r.id} className="p-3 border rounded">
              <div className="text-sm text-gray-600">{r.reviewerName} • {new Date(r.createdAt).toLocaleString()}</div>
              <div className="mt-1">{r.comment}</div>
            </div>
          ))}
        </div>

        <form onSubmit={async (e) => {
          e.preventDefault();
          // @ts-ignore
          const comment = e.currentTarget.comment.value;
          await fetch(`/api/admin/drafts/${params.id}/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment }) });
          location.reload();
        }} className="mt-4">
          <label htmlFor="comment" className="block text-sm font-medium">Add review/comment</label>
          <textarea id="comment" name="comment" title="Add review comment" placeholder="Write your review or notes here" className="mt-1 block w-full border p-2 rounded" />
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-2 bg-blue-600 text-white rounded">Add Comment</button>
            <button type="button" className="px-3 py-2 bg-green-600 text-white rounded" onClick={async () => {
              const comment = (document.getElementById('comment') as HTMLTextAreaElement)?.value || '';
              const res = await fetch(`/api/admin/drafts/${params.id}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment }) });
              if (res.ok) location.href = `/admin/articles/${params.id}/edit`;
              else (await import('react-hot-toast')).default.error('Approve failed');
            }}>Approve & Publish</button>
          </div>
        </form>
      </section>
    </div>
  );
}
