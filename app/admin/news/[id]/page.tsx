'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getNewsById, updateNews } from '@/lib/news';
import { useAuth } from '@/hooks/useAuth';
import type { NewsArticle, NewsArticleForm } from '@/types';

interface Props {
  params: {
    id: string;
  };
}

export default function EditArticlePage({ params }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<NewsArticleForm>({
    headline: '',
    excerpt: '',
    content: '',
    coverImageUrl: '',
    sourceName: '',
    tags: [],
    status: 'draft',
  });

  useEffect(() => {
    loadArticle();
  }, [params.id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const fetchedArticle = await getNewsById(params.id);
      
      if (!fetchedArticle) {
        setError('Article not found');
        return;
      }

      setArticle(fetchedArticle);
      setFormData({
        headline: fetchedArticle.headline,
        excerpt: fetchedArticle.excerpt,
        content: fetchedArticle.content,
        coverImageUrl: fetchedArticle.coverImageUrl || '',
        sourceName: fetchedArticle.sourceName || '',
        tags: fetchedArticle.tags || [],
        status: fetchedArticle.status,
      });
    } catch (error) {
      console.error('Failed to load article:', error);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to edit articles.');
      return;
    }

    if (!formData.headline.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      await updateNews(params.id, formData, user.uid);
      router.push('/admin/news');
    } catch (error) {
      console.error('Failed to update article:', error);
      setError('Failed to update article. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData({ ...formData, tags });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="space-y-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <Link
              href="/admin/news"
              className="inline-block mt-4 text-bd-green hover:text-emerald-600 transition-colors"
            >
              ← Back to News Management
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/news"
            className="inline-flex items-center gap-2 text-sm font-medium text-bd-green hover:text-emerald-600 transition-colors mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to News Management
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Article</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Update and manage your news article
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Headline */}
            <div>
              <label htmlFor="headline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Headline *
              </label>
              <input
                type="text"
                id="headline"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bd-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter article headline..."
                required
              />
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Excerpt *
              </label>
              <textarea
                id="excerpt"
                rows={3}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bd-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Brief summary of the article..."
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Short summary that will appear on news cards and social media
              </p>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                rows={12}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bd-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Write your article content here..."
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Full article content. Use **bold** and *italic* for basic formatting.
              </p>
            </div>

            {/* Cover Image URL */}
            <div>
              <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Image URL
              </label>
              <input
                type="url"
                id="coverImageUrl"
                value={formData.coverImageUrl || ''}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bd-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Source Name */}
              <div>
                <label htmlFor="sourceName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Source Name
                </label>
                <input
                  type="text"
                  id="sourceName"
                  value={formData.sourceName || ''}
                  onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bd-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="BD Election Desk"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bd-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => handleTagsChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bd-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="election, politics, bangladesh"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Separate tags with commas
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Link
                href="/admin/news"
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-bd-green text-white rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              {article?.status === 'published' && (
                <Link
                  href={`/news/${article.slug}`}
                  className="px-6 py-2 border border-bd-green text-bd-green rounded-lg font-medium hover:bg-bd-green hover:text-white transition-colors"
                >
                  View Published
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}