import { NICHES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Filter, Search, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

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
          <Filter className='h-5 w-5 text-primary' />
          Filters
        </h2>
        <span className='px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs font-semibold'>
          {resultCount} results
        </span>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 space-x-4'>
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
            <Search className='absolute left-3 top-2.5 h-5 w-5 text-muted-foreground' />
          </div>
        </div>

        {/* Niche Filter */}
        <div className='mb-8'>
          <label className='block text-sm font-semibold text-card-foreground mb-3'>
            Niche Categories
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='w-full justify-between bg-input border-border hover:bg-muted'
              >
                <span className='truncate'>
                  {selectedNiches.length === 0
                    ? 'Select Niches'
                    : selectedNiches.length === 1
                    ? selectedNiches[0]
                    : `${selectedNiches.length} selected`}
                </span>
                <ChevronDown className='h-4 w-4 opacity-50' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-[--radix-dropdown-menu-trigger-width] max-h-72 overflow-y-auto data-[side=bottom]:slide-in-from-top-0 data-[side=top]:slide-in-from-bottom-0 data-[state=open]:zoom-in-100'>
              <DropdownMenuLabel>Available Niches</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {NICHES.map((niche) => (
                <DropdownMenuCheckboxItem
                  key={niche}
                  checked={selectedNiches.includes(niche)}
                  onCheckedChange={() => handleNicheToggle(niche)}
                >
                  {niche}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
