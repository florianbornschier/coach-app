'use client';

import { useState, useMemo, useEffect } from 'react';
import ProfileCard from '@/components/ProfileCard';
import FilterSidebar from '@/components/FilterSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import Pagination from '@/components/Pagination';
import { mockCoaches } from '@/lib/mock-data';
import { filterCoaches } from '@/lib/utils';
import { FilterOptions } from '@/lib/types';

const ITEMS_PER_PAGE = 12;

export default function Home() {
  const [filters, setFilters] = useState<FilterOptions>({
    niches: [],
    minFollowers: 0,
    maxFollowers: 0,
    searchQuery: '',
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Filter coaches based on current filters
  const filteredCoaches = useMemo(
    () => filterCoaches(mockCoaches, filters),
    [filters]
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCoaches.length / ITEMS_PER_PAGE);
  const paginatedCoaches = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCoaches.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCoaches, currentPage]);

  const handleClearFilters = () => {
    setFilters({
      niches: [],
      minFollowers: 0,
      maxFollowers: 0,
      searchQuery: '',
    });
  };

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
        <DashboardHeader
          totalResults={mockCoaches.length}
          filteredResults={filteredCoaches}
        />

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-10'>
          {/* Sidebar */}
          <aside className='lg:col-span-1'>
            <FilterSidebar
              selectedNiches={filters.niches}
              minFollowers={filters.minFollowers}
              maxFollowers={filters.maxFollowers}
              searchQuery={filters.searchQuery}
              onNicheChange={(niches) => setFilters({ ...filters, niches })}
              onMinFollowersChange={(min) =>
                setFilters({ ...filters, minFollowers: min })
              }
              onMaxFollowersChange={(max) =>
                setFilters({ ...filters, maxFollowers: max })
              }
              onSearchChange={(query) =>
                setFilters({ ...filters, searchQuery: query })
              }
              onClearFilters={handleClearFilters}
              resultCount={filteredCoaches.length}
            />
          </aside>

          {/* Main Content */}
          <main className='lg:col-span-3'>
            {paginatedCoaches.length === 0 ? (
              <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center'>
                <svg
                  className='mx-auto h-16 w-16 text-slate-300 mb-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                <h3 className='text-xl font-bold text-slate-900 mb-2'>
                  No coaches found
                </h3>
                <p className='text-slate-500'>
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={handleClearFilters}
                  className='mt-6 px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors'
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {paginatedCoaches.map((coach) => (
                    <ProfileCard
                      key={coach.id}
                      profile={coach}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}


