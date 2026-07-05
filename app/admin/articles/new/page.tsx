import ArticleEditor from "@/components/ArticleEditor";
import Link from "next/link";

export default function NewAdminArticlePage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Create New Article</h1>
          <p className="mt-2 text-sm text-slate-600">Add a blog article or announcement to the site with clear, readable fields.</p>
        </div>

        <ArticleEditor submitPath="/api/admin/articles" />

        <div className="mt-6">
          <Link href="/admin" className="text-sm text-gray-600">← Back to Admin Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
