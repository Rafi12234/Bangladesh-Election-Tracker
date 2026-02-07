import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import { getNewsBySlug } from '@/lib/news';
import { formatDate } from '@/lib/utils';

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getNewsBySlug(params.slug);

  if (!article) {
    return {
      title: 'Article Not Found - Bangladesh Election Tracker',
    };
  }

  return {
    title: `${article.headline} - Bangladesh Election Tracker`,
    description: article.excerpt,
    openGraph: {
      title: article.headline,
      description: article.excerpt,
      images: article.coverImageUrl ? [{ url: article.coverImageUrl }] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getNewsBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const publishedDate = article.publishedAt 
    ? formatDate(article.publishedAt.toDate()) 
    : formatDate(article.createdAt.toDate());

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-gray-900">
        {/* Back Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-4">
            <Link 
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-medium text-bd-green hover:text-emerald-600 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to News
            </Link>
          </div>
        </div>

        {/* Article Content */}
        <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              {article.headline}
            </h1>
            
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <time dateTime={article.publishedAt?.toDate().toISOString()}>
                  {publishedDate}
                </time>
              </div>
              {article.sourceName && (
                <div className="flex items-center">
                  <span className="font-medium">By {article.sourceName}</span>
                </div>
              )}
              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-bd-green/10 text-bd-green rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Cover Image */}
            {article.coverImageUrl && (
              <div className="mb-8">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-lg">
                  <Image
                    src={article.coverImageUrl}
                    alt={article.headline}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            )}
          </header>

          {/* Article Body */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8 font-light border-l-4 border-bd-green pl-6">
              {article.excerpt}
            </div>
            
            <div className="text-gray-900 dark:text-gray-100 leading-relaxed">
              {article.content.split('\n').map((paragraph, index) => {
                if (paragraph.trim() === '') return null;
                
                // Basic markdown-style formatting
                let formattedParagraph = paragraph
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>');

                return (
                  <p 
                    key={index} 
                    className="mb-6 text-lg leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formattedParagraph }}
                  />
                );
              })}
            </div>
          </div>
        </article>

        {/* Related Articles / Back to News */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <Link 
                href="/news"
                className="inline-flex items-center gap-2 px-6 py-3 bg-bd-green text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
              >
                Read More News
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}