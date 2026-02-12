'use client';

import { useState, useEffect } from 'react';
import { getPublishedNews } from '@/lib/news';
import NewsCard from './NewsCard';
import type { NewsArticle } from '@/types';

export default function NewsGrid() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const fetchedArticles = await getPublishedNews();
      setArticles(fetchedArticles);
    } catch (error) {
      console.error('Failed to load articles:', error);
      setError('Failed to load news articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <NewsGridSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <button
            onClick={loadArticles}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return <NewsEmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
}

function NewsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-soft overflow-hidden animate-pulse">
          {/* Image skeleton */}
          <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
          
          {/* Content skeleton */}
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
            
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function NewsEmptyState() {
  return (
    <div className="text-center py-16">
      <div className="mx-auto max-w-md">
        <svg 
          className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" 
          />
        </svg>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No News Articles Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Check back soon for the latest election news and updates.
        </p>
      </div>
    </div>
  );
}