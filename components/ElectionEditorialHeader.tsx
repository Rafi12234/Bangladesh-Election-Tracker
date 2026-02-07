'use client';

interface UpcomingElection {
  title: string;
  description: string;
  dateLabel: string;
  country: string;
  type: string;
  status: 'upcoming' | 'live' | 'completed';
}

interface ElectionEditorialHeaderProps {
  data: UpcomingElection;
}

const statusConfig = {
  upcoming: {
    label: 'Upcoming',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  live: {
    label: 'Live',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
} as const;

export default function ElectionEditorialHeader({ data }: ElectionEditorialHeaderProps) {
  const { title, description, dateLabel, type, country, status } = data;
  const statusStyle = statusConfig[status];

  return (
    <section 
      className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
      role="banner"
      aria-labelledby="election-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="relative">
          {/* Left accent border */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-bd-green to-emerald-600 rounded-full" />
          
          <header className="pl-8 space-y-6">
            {/* Kicker row */}
            <div className="flex items-center gap-4">
              <span 
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusStyle.className}`}
                aria-label={`Election status: ${statusStyle.label}`}
              >
                {status === 'live' && (
                  <span className="flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
                {statusStyle.label}
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Bangladesh Election
              </span>
            </div>

            {/* Headline */}
            <h1 
              id="election-title"
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight"
            >
              {title}
            </h1>

            {/* Lead paragraph */}
            <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl leading-relaxed font-light">
              {description}
            </p>

            {/* Meta info row */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-base text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-bd-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6l-2-2m0 0l-2-2m2 2l2-2m-2 2v6m-2-2h4" />
                </svg>
                <span className="font-medium">{dateLabel}</span>
              </div>

              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-bd-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">{country}</span>
              </div>

              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-bd-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">{type}</span>
              </div>
            </div>
          </header>
        </div>
      </div>
    </section>
  );
}

// Export the UpcomingElection type for use in other components
export type { UpcomingElection };