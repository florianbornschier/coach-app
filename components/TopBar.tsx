'use client';

import Logo from './Logo';
import { HeadphonesIcon } from 'lucide-react';
import { Button } from './ui/button';

export default function TopBar() {
  return (
    <header className='fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/50 shadow-lg'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16 md:h-20'>
          {/* Logo */}
          <Logo />

          {/* Support Button */}
          <Button
            variant='outline'
            size='sm'
            className='flex items-center gap-2 bg-card/50 backdrop-blur-sm hover:bg-primary/10 border-border/50'
          >
            <HeadphonesIcon className='h-4 w-4' />
            <span className='hidden sm:inline'>Support</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
