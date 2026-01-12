'use client';

import TopBar from '@/components/TopBar';
import CoachFinder from '@/components/coach-finder';

export default function Home() {
  return (
    <>
      <TopBar />
      <div className='min-h-screen bg-background pt-20 md:pt-24 mx-auto px-4 sm:px-6 lg:px-8'>
        <CoachFinder />
      </div>
    </>
  );
}
