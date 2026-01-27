'use client';

import { useState } from 'react';
import { redirect } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import CoachesTable from '@/components/admin/CoachesTable';
import CoachesFilter from '@/components/admin/CoachesFilter';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function CoachesPage() {
  const [filters, setFilters] = useState({
    search: '',
    niche: '',
  });

  return (
    <AdminLayout>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-foreground'>Coaches</h1>
            <p className='mt-2 text-muted-foreground'>
              Manage all coach profiles in the database
            </p>
          </div>
          <Link href='/admin/coaches/new'>
            <Button className='bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'>
              <Plus className='mr-2 h-4 w-4' />
              Add Coach
            </Button>
          </Link>
        </div>

        <CoachesFilter onFilterChange={setFilters} />

        <CoachesTable search={filters.search} niche={filters.niche} />
      </div>
    </AdminLayout>
  );
}
