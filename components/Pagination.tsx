'use client';

/**
 * Pagination — Reusable numbered pagination component.
 * Displays page numbers with ellipsis for large ranges,
 * plus prev/next arrow buttons. Accessible via aria attributes.
 */

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];
  const delta = 1; // pages shown around current

  pages.push(1);

  const rangeStart = Math.max(2, currentPage - delta);
  const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

  if (rangeStart > 2) pages.push('ellipsis');

  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  if (rangeEnd < totalPages - 1) pages.push('ellipsis');

  if (totalPages > 1) pages.push(totalPages);

  return pages;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-1.5 sm:gap-2">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        className="inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-800 shadow-sm"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page numbers */}
      {getPageNumbers(currentPage, totalPages).map((page, i) => {
        if (page === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${i}`}
              className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 text-gray-400 dark:text-gray-500 text-sm font-medium select-none"
            >
              &hellip;
            </span>
          );
        }

        const isActive = page === currentPage;

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={isActive ? 'page' : undefined}
            className={`inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm ${
              isActive
                ? 'bg-gradient-to-r from-bd-green to-emerald-600 dark:from-emerald-600 dark:to-emerald-500 text-white shadow-lg scale-110 ring-2 ring-emerald-300 dark:ring-emerald-500/50'
                : 'border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
            }`}
          >
            {page}
          </button>
        );
      })}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        className="inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-800 shadow-sm"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}
