// import { CoachProfile } from '@/lib/types';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <h1 className='text-2xl md:text-3xl font-bebas tracking-tight leading-none'>
        <span className='text-primary'>TOP</span>
        <span className='text-foreground'>CLOSER</span>
      </h1>
    </div>
  );
}
