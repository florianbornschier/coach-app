import { redirect, notFound } from 'next/navigation';
import { isAdmin } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import AdminLayout from '@/components/admin/AdminLayout';
import CoachForm from '@/components/admin/CoachForm';

export default async function EditCoachPage({
    params,
}: {
    params: { id: string };
}) {
    const admin = await isAdmin();

    if (!admin) {
        redirect('/');
    }

    const coach = await prisma.coachProfile.findUnique({
        where: { id: params.id },
    });

    if (!coach) {
        notFound();
    }

    return (
        <AdminLayout>
            <div className='space-y-6'>
                <div>
                    <h1 className='text-3xl font-bold text-gray-900'>
                        Edit Coach: @{coach.username}
                    </h1>
                    <p className='mt-2 text-gray-600'>
                        Update coach profile information
                    </p>
                </div>

                <CoachForm coach={coach} />
            </div>
        </AdminLayout>
    );
}
