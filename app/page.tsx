import Link from 'next/link';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Search, Zap, Shield, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className='flex min-h-screen flex-col bg-white'>
      {/* Navigation */}
      <header className='fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md'>
        <div className='container mx-auto flex h-16 items-center justify-between px-4'>
          <div className='flex items-center gap-2'>
            <Logo />
            <span className='text-xl font-bold tracking-tight text-foreground'>CoachApp</span>
          </div>
          <nav className='hidden items-center gap-8 md:flex'>
            <Link href='#features' className='text-sm font-medium text-muted-foreground hover:text-primary transition-colors'>Features</Link>
            <Link href='#about' className='text-sm font-medium text-muted-foreground hover:text-primary transition-colors'>About</Link>
          </nav>
          <div className='flex items-center gap-4'>
            <Link href='/login'>
              <Button variant='ghost' className='hidden sm:inline-flex'>Login</Button>
            </Link>
            <Link href='/signup'>
              <Button className='bg-primary text-primary-foreground hover:bg-primary/90'>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className='flex-1'>
        {/* Hero Section */}
        <section className='relative overflow-hidden pb-20 pt-32 md:pb-32 md:pt-48'>
          {/* Background Gradients */}
          <div className='absolute left-1/2 top-0 -z-10 h-[600px] w-full -translate-x-1/2 overflow-hidden opacity-20'>
            <div className='absolute -left-[10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-primary/30 blur-[100px]'></div>
            <div className='absolute -right-[10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px]'></div>
          </div>

          <div className='container mx-auto px-4 text-center'>
            <div className='inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-bottom-3 duration-700'>
              <Zap className='h-4 w-4 text-primary' />
              <span>The #1 Platform for German Coaches</span>
            </div>

            <h1 className='mt-8 font-bebas text-6xl tracking-tight text-foreground md:text-8xl lg:text-9xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100'>
              FIND YOUR <span className='text-primary'>PERFECT</span> COACH
            </h1>

            <p className='mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200'>
              Discover and connect with top-tier German Instagram coaches.
              The most comprehensive database for professional development and growth.
            </p>

            <div className='mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300'>
              <Link href='/signup'>
                <Button size='lg' className='h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20'>
                  Get Started for Free <ArrowRight className='ml-2 h-5 w-5' />
                </Button>
              </Link>
              <Link href='/login'>
                <Button size='lg' variant='outline' className='h-14 px-8 text-lg transition-all hover:bg-muted active:scale-95'>
                  Browse Coaches
                </Button>
              </Link>
            </div>

            {/* Mockup Preview */}
            <div className='mt-16 rounded-2xl border bg-card p-2 shadow-2xl animate-in fade-in zoom-in duration-1000 delay-500'>
              <div className='aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted/50'>
                <div className='flex h-full items-center justify-center text-muted-foreground'>
                  <Users className='h-24 w-24 opacity-20' />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id='features' className='bg-muted/30 py-24 md:py-32'>
          <div className='container mx-auto px-4'>
            <div className='mb-16 text-center'>
              <h2 className='font-bebas text-4xl text-foreground md:text-6xl'>POWERFUL FEATURES</h2>
              <p className='mt-4 text-muted-foreground'>Everything you need to find the right mentor</p>
            </div>

            <div className='grid gap-8 md:grid-cols-3'>
              {[
                {
                  title: 'Deep Search',
                  description: 'Filter coaches by niche, follower count, engagement rates, and more.',
                  icon: Search
                },
                {
                  title: 'Verified Profiles',
                  description: 'Every coach in our database is vetted for authenticity and quality.',
                  icon: Shield
                },
                {
                  title: 'Instant Connection',
                  description: 'Reach out to your favorite coaches directly via their preferred platforms.',
                  icon: Zap
                }
              ].map((feature, i) => (
                <div key={i} className='group rounded-2xl border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/20'>
                  <div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110'>
                    <feature.icon className='h-6 w-6' />
                  </div>
                  <h3 className='mb-2 text-xl font-bold'>{feature.title}</h3>
                  <p className='text-muted-foreground'>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className='py-24'>
          <div className='container mx-auto px-4'>
            <div className='flex flex-wrap items-center justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500'>
              <span className='text-2xl font-bold'>COACH.DE</span>
              <span className='text-2xl font-bold'>INSTAGROW</span>
              <span className='text-2xl font-bold'>MENTOR.ME</span>
              <span className='text-2xl font-bold'>GERMANPRO</span>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='container mx-auto mb-24 px-4'>
          <div className='relative overflow-hidden rounded-3xl bg-gray-900 px-8 py-20 text-center text-white'>
            <div className='absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.15)_0,transparent_100%)]'></div>
            <h2 className='relative z-10 font-bebas text-5xl md:text-7xl'>READY TO SCALE YOUR GROWTH?</h2>
            <p className='relative z-10 mx-auto mt-6 max-w-xl text-lg text-gray-400'>
              Join thousands of professionals finding their perfect mentors on CoachApp today.
            </p>
            <div className='relative z-10 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row'>
              <Link href='/signup'>
                <Button size='lg' className='h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90'>
                  Create Free Account
                </Button>
              </Link>
              <Link href='/admin_login'>
                <Button size='lg' variant='outline' className='h-14 border-gray-700 bg-transparent text-white hover:bg-gray-800'>
                  Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className='border-t py-12'>
        <div className='container mx-auto px-4'>
          <div className='flex flex-col items-center justify-between gap-6 md:flex-row'>
            <div className='flex items-center gap-2'>
              <Logo />
              <span className='font-bold'>CoachApp</span>
            </div>
            <p className='text-sm text-muted-foreground'>
              © 2026 CoachApp. All rights reserved. Built for German Coaches.
            </p>
            <div className='flex items-center gap-6'>
              <Link href='#' className='text-sm text-muted-foreground hover:text-foreground'>Terms</Link>
              <Link href='#' className='text-sm text-muted-foreground hover:text-foreground'>Privacy</Link>
              <Link href='#' className='text-sm text-muted-foreground hover:text-foreground'>Twitter</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
