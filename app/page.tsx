'use client';

import { useState, useMemo, useEffect } from 'react';
import ProfileCard from '@/components/ProfileCard';
import RelatedAccountCard from '@/components/RelatedAccountCard';
import FilterSidebar from '@/components/FilterSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import TopBar from '@/components/TopBar';
import Pagination from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { filterCoaches } from '@/lib/utils';
import { FilterOptions, CoachProfile } from '@/lib/types';

const ITEMS_PER_PAGE = 12;

export default function Home() {
  const [filters, setFilters] = useState<FilterOptions>({
    niches: [],
    minFollowers: 0,
    maxFollowers: 0,
    searchQuery: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [coaches, setCoaches] = useState<CoachProfile[]>([]);
  const [relatedAccounts, setRelatedAccounts] = useState<CoachProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  // Handle search query - when user types a username and presses Enter or stops typing
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (filters.searchQuery.trim()) {
        const username = filters.searchQuery.trim();
        // Only search if it's a valid username format and not already in the list
        if (
          username.length > 0 &&
          !coaches.some((c) => c.username === username)
        ) {
          const fetchSearchedProfile = async () => {
            setSearching(true);
            setError(null);
            try {
              const response = await fetch(
                `/api/instagram?usernames=${username}`
              );

              if (response.ok) {
                const data = await response.json();
                const newProfiles = data.profiles || [];
                const newRelatedAccounts = data.relatedAccounts || [];

                // Merge with existing profiles, avoiding duplicates
                setCoaches((prev) => {
                  const existingUsernames = new Set(
                    prev.map((p: CoachProfile) => p.username)
                  );
                  const uniqueNewProfiles = newProfiles.filter(
                    (p: CoachProfile) => !existingUsernames.has(p.username)
                  );
                  return [...prev, ...uniqueNewProfiles];
                });

                // Merge related accounts, avoiding duplicates with main profiles and existing related accounts
                setRelatedAccounts((prev) => {
                  const existingUsernames = new Set([
                    ...coaches.map((p: CoachProfile) =>
                      p.username.toLowerCase()
                    ),
                    ...prev.map((p: CoachProfile) => p.username.toLowerCase()),
                  ]);
                  const uniqueNewRelated = newRelatedAccounts.filter(
                    (p: CoachProfile) =>
                      !existingUsernames.has(p.username.toLowerCase())
                  );
                  return [...prev, ...uniqueNewRelated];
                });
              } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to fetch profile');
              }
            } catch (err) {
              const errorMessage =
                err instanceof Error ? err.message : 'Failed to fetch profile';
              setError(errorMessage);
              console.error('Error searching profile:', err);
            } finally {
              setSearching(false);
            }
          };

          fetchSearchedProfile();
        }
      }
    }, 1000); // Debounce search by 1 second

    return () => clearTimeout(searchTimeout);
  }, [filters.searchQuery, coaches]);

  // Filter coaches based on current filters
  const filteredCoaches = useMemo(
    () => filterCoaches(coaches, filters),
    [coaches, filters]
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
    <>
      <TopBar />
      <div className='min-h-screen bg-background pt-20 md:pt-24'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
          <DashboardHeader
            totalResults={coaches.length}
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
              {coaches.length === 0 && !searching ? (
                <div className='bg-card rounded-xl shadow-sm border border-border p-16 text-center'>
                  <svg
                    className='mx-auto h-16 w-16 text-muted-foreground mb-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.5}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                  <h3 className='text-xl font-bold text-card-foreground mb-2'>
                    Search for German Instagram Coaches
                  </h3>
                  <p className='text-muted-foreground mb-4'>
                    Enter an Instagram username in the search box to find German
                    coaches and influencers
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Only German accounts will be displayed. Try searching for
                    usernames like "pamela_rf" or any German coach's handle.
                  </p>
                </div>
              ) : searching && coaches.length === 0 ? (
                <div className='bg-card rounded-xl shadow-sm border border-border p-16 text-center'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
                  <h3 className='text-xl font-bold text-card-foreground mb-2'>
                    Searching for profile...
                  </h3>
                  <p className='text-muted-foreground'>
                    Fetching Instagram profile data
                  </p>
                </div>
              ) : error && coaches.length === 0 ? (
                <div className='bg-card rounded-xl shadow-sm border border-border p-16 text-center'>
                  <svg
                    className='mx-auto h-16 w-16 text-destructive/60 mb-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.5}
                      d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  <h3 className='text-xl font-bold text-card-foreground mb-2'>
                    Error loading profile
                  </h3>
                  <p className='text-muted-foreground mb-4'>{error}</p>
                  {error.includes('Rate limit') && (
                    <p className='text-sm text-muted-foreground mb-4'>
                      You've hit the API rate limit. Please wait a moment before
                      searching again.
                    </p>
                  )}
                  <button
                    onClick={() => setError(null)}
                    className='mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors'
                  >
                    Try Again
                  </button>
                </div>
              ) : paginatedCoaches.length === 0 ? (
                <div className='bg-card rounded-xl shadow-sm border border-border p-16 text-center'>
                  <svg
                    className='mx-auto h-16 w-16 text-muted-foreground mb-6'
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
                  <h3 className='text-xl font-bold text-card-foreground mb-2'>
                    No coaches found
                  </h3>
                  <p className='text-muted-foreground'>
                    Try adjusting your filters or search terms
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className='mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors'
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <>
                  {searching && (
                    <div className='mb-4 text-sm text-muted-foreground text-center'>
                      Searching for more profiles...
                    </div>
                  )}
                  {error && (
                    <div className='mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm'>
                      {error}
                    </div>
                  )}
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

                  {/* Related Accounts Section */}
                  {relatedAccounts.length > 0 && (
                    <div className='mt-12'>
                      <div className='flex items-center justify-between mb-6'>
                        <div>
                          <h2 className='text-2xl font-bold text-foreground'>
                            Related Accounts
                          </h2>
                          <p className='text-sm text-muted-foreground mt-1'>
                            Accounts related to the profiles you searched
                          </p>
                        </div>
                        <Badge
                          variant='secondary'
                          className='text-sm'
                        >
                          {relatedAccounts.length} account
                          {relatedAccounts.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                        {relatedAccounts.map((account) => (
                          <RelatedAccountCard
                            key={account.id}
                            profile={account}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
