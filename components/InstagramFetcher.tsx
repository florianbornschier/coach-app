'use client';

import { useState, useEffect } from 'react';
import { useInstagramData } from '@/lib/hooks/useInstagramData';
import { Button } from '@/components/ui/button';

interface InstagramFetcherProps {
  onProfilesFetched?: (profiles: any[]) => void;
}

/**
 * Component to fetch Instagram profiles by username
 * This is an example component showing how to use the Instagram API
 */
export default function InstagramFetcher({
  onProfilesFetched,
}: InstagramFetcherProps) {
  const [usernames, setUsernames] = useState('');
  const { profiles, loading, error, fetchProfiles } = useInstagramData();

  const handleFetch = async () => {
    const usernameList = usernames
      .split(',')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (usernameList.length === 0) {
      alert('Please enter at least one username');
      return;
    }

    await fetchProfiles(usernameList);
  };

  // Call callback when profiles are fetched
  useEffect(() => {
    if (profiles.length > 0 && onProfilesFetched) {
      onProfilesFetched(profiles);
    }
  }, [profiles, onProfilesFetched]);

  return (
    <div className='bg-card rounded-xl shadow-sm border border-border p-6'>
      <h3 className='text-lg font-semibold text-card-foreground mb-4'>
        Fetch Instagram Profiles
      </h3>
      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-card-foreground mb-2'>
            Instagram Usernames (comma-separated)
          </label>
          <input
            type='text'
            value={usernames}
            onChange={(e) => setUsernames(e.target.value)}
            placeholder='username1, username2, username3'
            className='w-full px-4 py-2 border border-border bg-input text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground'
            disabled={loading}
          />
          <p className='text-xs text-muted-foreground mt-1'>
            Enter Instagram usernames separated by commas. Only German accounts
            will be returned.
          </p>
        </div>

        <Button
          onClick={handleFetch}
          disabled={loading || !usernames.trim()}
          className='w-full'
        >
          {loading ? 'Fetching...' : 'Fetch Profiles'}
        </Button>

        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm'>
            Error: {error}
          </div>
        )}

        {profiles.length > 0 && (
          <div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm'>
            Successfully fetched {profiles.length} German profile(s)!
          </div>
        )}
      </div>
    </div>
  );
}
