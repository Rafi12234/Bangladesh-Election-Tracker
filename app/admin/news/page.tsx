'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { getAllNews, deleteNews } from '@/lib/news';
import { formatDate } from '@/lib/utils';
import type { NewsArticle } from '@/types';

type StatusFilter = 'all' | 'published' | 'draft';

const statusColors = {
  published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
};

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, statusFilter, searchQuery]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const fetchedArticles = await getAllNews();
      setArticles(fetchedArticles);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(article => article.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.headline.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.sourceName?.toLowerCase().includes(query) ||
        article.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredArticles(filtered);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNews(id);
      setArticles(articles.filter(article => article.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete article:', error);
      // TODO: Show error toast
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">News Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage news articles and announcements
            </p>
          </div>
          <Link
            href="/admin/news/new"
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-bd-green text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Create Article
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bd-green focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bd-green focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm">
              <span className="font-medium text-gray-900 dark:text-white">Total: </span>
              <span className="text-gray-600 dark:text-gray-400">{articles.length}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-900 dark:text-white">Published: </span>
              <span className="text-gray-600 dark:text-gray-400">
                {articles.filter(a => a.status === 'published').length}
              </span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-900 dark:text-white">Drafts: </span>
              <span className="text-gray-600 dark:text-gray-400">
                {articles.filter(a => a.status === 'draft').length}
              </span>
            </div>
          </div>
        </div>

        {/* Articles List */}
        {filteredArticles.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchQuery || statusFilter !== 'all' 
                ? 'No articles found matching your criteria.' 
                : 'No articles yet. Create your first article!'
              }
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredArticles.map((article) => (
                <div key={article.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {article.headline}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[article.status]}`}
                        >
                          {article.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          Updated: {formatDate(article.updatedAt.toDate())}
                        </span>
                        {article.sourceName && (
                          <span>By {article.sourceName}</span>
                        )}
                        {article.tags && article.tags.length > 0 && (
                          <span>{article.tags.length} tags</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      {article.status === 'published' && (
                        <Link
                          href={`/news/${article.slug}`}
                          className="p-2 text-gray-400 hover:text-bd-green transition-colors"
                          title="View Article"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                      )}
                      
                      <Link
                        href={`/admin/news/${article.id}`}
                        className="p-2 text-gray-400 hover:text-bd-green transition-colors"
                        title="Edit Article"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      
                      <button
                        onClick={() => setDeleteConfirm(article.id!)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Article"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delete Article
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this article? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}