import { CalendarIcon, MapPinIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function ElectionBanner() {
  return (
    <div className="bg-white dark:bg-slate-900 border-l-4 border-l-blue-500 dark:border-l-blue-400">
      <div className="mx-auto max-w-7xl px-6 py-8 md:py-12">
        {/* Status Badge */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-3">
            <span className="rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white">
              Upcoming
            </span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              BANGLADESH ELECTION
            </span>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Bangladesh Parliamentary
          <br />
          Election 2026
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-4xl leading-relaxed">
          Follow live results and updates from the 12th National Parliamentary Election of Bangladesh 
          as the nation votes to shape its democratic future.
        </p>

        {/* Metadata */}
        <div className="flex flex-wrap gap-6 md:gap-8">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <CalendarIcon className="h-4 w-4" />
            <span className="text-sm">February 12, 2026</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <MapPinIcon className="h-4 w-4" />
            <span className="text-sm">Bangladesh</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <DocumentTextIcon className="h-4 w-4" />
            <span className="text-sm">Parliamentary Election</span>
          </div>
        </div>
      </div>
    </div>
  );
}