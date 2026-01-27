import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin/auth';
import AdminLayout from '@/components/admin/AdminLayout';
import CoachForm from '@/components/admin/CoachForm';

export default async function NewCoachPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/');
  }

  return (
    <AdminLayout>
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Add New Coach</h1>
          <p className='mt-2 text-gray-600'>
            Create a new coach profile in the database
          </p>
        </div>

        <CoachForm />
      </div>
    </AdminLayout>
  );
}
