import Link from 'next/link';
import Image from 'next/image';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import type { NewsArticle } from '@/types';

interface NewsCardProps {
  article: NewsArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  const publishedDate = article.publishedAt 
    ? article.publishedAt.toDate() 
    : article.createdAt.toDate();

  return (
    <Link href={`/news/${article.slug}`} className="group">
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-soft hover:shadow-lg transition-all duration-200 overflow-hidden group-hover:-translate-y-1">
        {/* Cover Image */}
        <div className="relative aspect-video overflow-hidden">
          {article.coverImageUrl ? (
            <Image
              src={article.coverImageUrl}
              alt={article.headline}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-bd-green/10 to-emerald-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
              <svg 
                className="h-12 w-12 text-bd-green/30 dark:text-gray-500" 
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
            </div>
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200" />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Headline */}
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-bd-green transition-colors">
            {article.headline}
          </h2>

          {/* Excerpt */}
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
            {article.excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              <time dateTime={publishedDate.toISOString()}>
                {formatDate(publishedDate)}
              </time>
            </div>
            
            {article.sourceName && (
              <div className="flex items-center">
                <span className="font-medium">{article.sourceName}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {article.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-bd-green/10 text-bd-green rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
              {article.tags.length > 2 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                  +{article.tags.length - 2} more
                </span>
              )}
            </div>
          )}

          {/* Read More CTA */}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <span className="text-bd-green text-sm font-medium group-hover:text-emerald-600 transition-colors inline-flex items-center gap-1">
              Read Full Article
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}