import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CoachProfile, FilterOptions } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFollowerCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return count.toString();
}

export function filterCoaches(
  coaches: CoachProfile[],
  filters: FilterOptions
): CoachProfile[] {
  return coaches.filter((coach) => {
    // Search query filter (username or niche)
    if (
      filters.searchQuery &&
      !coach.username
        .toLowerCase()
        .includes(filters.searchQuery.toLowerCase()) &&
      !coach.niche.toLowerCase().includes(filters.searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Niche filter
    if (filters.niches.length > 0 && !filters.niches.includes(coach.niche)) {
      return false;
    }

    // Min followers filter
    if (
      filters.minFollowers > 0 &&
      coach.followerCount < filters.minFollowers
    ) {
      return false;
    }

    // Max followers filter
    if (
      filters.maxFollowers > 0 &&
      coach.followerCount > filters.maxFollowers
    ) {
      return false;
    }

    return true;
  });
}

export function exportToCSV(coaches: CoachProfile[]) {
  if (coaches.length === 0) return;

  const headers = ['Username', 'Niche', 'Followers', 'Verified'];
  const csvRows = coaches.map((coach) => [
    coach.username,
    coach.niche,
    coach.followerCount,
    coach.verified ? 'Yes' : 'No',
  ]);

  const csvContent = [
    headers.join(','),
    ...csvRows.map((row) => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `coach_export_${new Date().toISOString().split('T')[0]}.csv`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
