import ArticleEditor from "@/components/ArticleEditor";
import Link from "next/link";

export default function NewModeratorArticlePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create New Article</h1>
          <p className="text-sm text-gray-600">Add a blog article or announcement to the site (moderator).</p>
        </div>

        <ArticleEditor submitPath="/api/moderator/articles" />

        <div className="mt-6">
          <Link href="/dashboard" className="text-sm text-gray-600">← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
