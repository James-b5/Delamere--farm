import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import React, { ReactNode } from 'react';

interface AdminPageLayoutProps {
  /** Page title */
  title: string;
  /** URL for back‑to‑admin link */
  backLink?: string;
  /** URL for the "Add New" button */
  addLink: string;
  /** Label for the add button */
  addLabel: string;
  /** Current search value */
  search: string;
  /** Callback to update search */
  setSearch: (value: string) => void;
  /** Optional loading state */
  loading?: boolean;
  /** Children content (typically a table) */
  children: ReactNode;
}

export default function AdminPageLayout({
  title,
  backLink = '/admin',
  addLink,
  addLabel,
  search,
  setSearch,
  loading = false,
  children,
}: AdminPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link href={backLink} className="flex items-center text-green-600 hover:text-green-700 mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Admin
        </Link>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
          <Link
            href={addLink}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            {addLabel}
          </Link>
        </div>
        <div className="mb-6">
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()} by name...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 cursor-text"
          />
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
