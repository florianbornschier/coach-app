import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { LoginForm } from '@/components/login-form';
import Link from 'next/link';

export default async function AdminLoginPage() {
  const session = await auth() as any;

  if (session?.isAdminAuthenticated) {
    redirect('/admin');
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Admin Login
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Sign in to access the admin panel
          </p>
        </div>

        <LoginForm loginType="admin" />

        <div className='text-center'>
          <Link
            href='/login'
            className='text-sm text-primary hover:text-primary/90 transition-colors'
          >
            Regular user login
          </Link>
        </div>
      </div>
    </div>
  );
}
