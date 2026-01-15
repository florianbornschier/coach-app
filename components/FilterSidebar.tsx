import { NICHES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface FilterSidebarProps {
  selectedNiches: string[];
  minFollowers: number;
  maxFollowers: number;
  searchQuery: string;
  onNicheChange: (niches: string[]) => void;
  onMinFollowersChange: (value: number) => void;
  onMaxFollowersChange: (value: number) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  resultCount: number;
}

export default function FilterSidebar({
  selectedNiches,
  minFollowers,
  maxFollowers,
  searchQuery,
  onNicheChange,
  onMinFollowersChange,
  onMaxFollowersChange,
  onSearchChange,
  onClearFilters,
  resultCount,
}: FilterSidebarProps) {
  const handleNicheToggle = (niche: string) => {
    if (selectedNiches.includes(niche)) {
      onNicheChange(selectedNiches.filter((n) => n !== niche));
    } else {
      onNicheChange([...selectedNiches, niche]);
    }
  };

  return (
    <div className='bg-card rounded-xl shadow-sm border border-border p-6 sticky top-6 h-fit'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <h2 className='text-lg font-bold text-card-foreground flex items-center gap-2'>
          <svg
            className='h-5 w-5 text-primary'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
            />
          </svg>
          Filters
        </h2>
        <span className='px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs font-semibold'>
          {resultCount} results
        </span>
      </div>

      {/* Search */}
      <div className='mb-8'>
        <label className='block text-sm font-semibold text-card-foreground mb-2'>
          Username
        </label>
        <div className='relative'>
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='Search handle...'
            className='w-full px-4 py-2 pl-10 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground text-foreground'
          />
          <svg
            className='absolute left-3 top-2.5 h-5 w-5 text-muted-foreground'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
        </div>
      </div>

      {/* Niche Filter */}
      <div className='mb-8'>
        <label className='block text-sm font-semibold text-card-foreground mb-3'>
          Niche Categories
        </label>
        <div className='flex flex-row gap-2 overflow-x-auto sm:overflow-x-scroll md:overflow-x-scroll lg:overflow-x-visible lg:overflow-y-auto lg:max-h-72 pb-2 lg:pb-0 -mx-2 px-2 lg:mx-0 lg:px-0 custom-scrollbar scrollbar-thin scrollbar-thumb-border scrollbar-track-muted'>
          {NICHES.map((niche) => {
            const isSelected = selectedNiches.includes(niche);
            return (
              <Button
                key={niche}
                type='button'
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => handleNicheToggle(niche)}
                className={`flex items-center gap-2 whitespace-nowrap shrink-0 h-auto py-2 px-3 ${
                  isSelected
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                    : 'bg-card text-card-foreground hover:bg-muted border-border'
                }`}
              >
                {isSelected && <Check className='h-4 w-4 shrink-0' />}
                <span className='text-sm font-medium'>{niche}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Follower Count Range */}
      <div className='mb-8'>
        <label className='block text-sm font-semibold text-card-foreground mb-3'>
          Follower Count Range
        </label>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className='block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1'>
              Min
            </label>
            <input
              type='number'
              value={minFollowers || ''}
              onChange={(e) =>
                onMinFollowersChange(parseInt(e.target.value) || 0)
              }
              placeholder='0'
              className='w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground'
            />
          </div>
          <div>
            <label className='block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1'>
              Max
            </label>
            <input
              type='number'
              value={maxFollowers || ''}
              onChange={(e) =>
                onMaxFollowersChange(parseInt(e.target.value) || 0)
              }
              placeholder='Any'
              className='w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground'
            />
          </div>
        </div>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={onClearFilters}
        className='w-full px-4 py-2.5 text-sm font-bold text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors'
      >
        Clear All
      </button>
    </div>
  );
}
