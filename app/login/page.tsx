import { LoginForm } from '@/components/login-form';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await auth() as any;

  if (session?.isUserAuthenticated) {
    redirect('/dashboard');
  }

  return (
    <div className='bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <div className='flex w-full max-w-sm flex-col gap-6'>
        <Link
          href='/'
          className='flex items-center gap-2 self-center font-medium'
        >
          <Logo />
        </Link>
        <LoginForm loginType="user" />
      </div>
    </div>
  );
}
