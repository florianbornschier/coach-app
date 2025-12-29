import { CoachProfile } from '@/lib/types';
import { exportToCSV } from '@/lib/utils';
import { Button } from './ui/button';
import { BookOpen, DownloadIcon } from 'lucide-react';

interface DashboardHeaderProps {
  totalResults: number;
  filteredResults: CoachProfile[];
}

export default function DashboardHeader({
  totalResults,
  filteredResults,
}: DashboardHeaderProps) {
  const handleExport = () => {
    exportToCSV(filteredResults);
  };

  return (
    <div className='relative overflow-hidden rounded-2xl bg-card shadow-lg border border-border/50 mb-10'>
      {/* Subtle gradient background */}
      <div className='absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-accent/5' />

      <div className='relative p-8 md:p-12'>
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8'>
          <div className='max-w-2xl'>
            <h1 className='text-2xl md:text-3xl font-bold text-foreground mb-3'>
              Coach Finder
            </h1>
            <p className='text-lg text-foreground/70'>
              Discover top coaches and sellers across niches •{' '}
              {totalResults.toLocaleString()} profiles available
            </p>
            <p className='mt-2 text-sm text-foreground/60'>
              Showing{' '}
              <span className='font-semibold text-primary'>
                {filteredResults.length.toLocaleString()}
              </span>{' '}
              filtered results
            </p>
          </div>

          <div className='flex flex-col sm:flex-row items-center gap-4'>
            {/* Results badge */}
            <Button
              variant={'outline'}
              className='flex items-center px-6 py-3 gap-3 rounded-xl'
            >
              <BookOpen className='mr-1 size-5' />
              <span className='flex items-center gap-2'>
                <span className='text-xl font-bold text-foreground'>
                  {filteredResults.length}
                </span>
                <span className='text-sm text-foreground/60'>
                  Active results
                </span>
              </span>
            </Button>

            {/* Export Button */}
            <Button
              onClick={handleExport}
              disabled={filteredResults.length === 0}
              className='cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300'
            >
              <DownloadIcon className='mr-1 size-5' />
              Export CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
