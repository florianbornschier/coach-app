import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/');
  }

  // Fetch statistics
  const [totalCoaches, totalUsers, verifiedCoaches, recentCoaches] =
    await Promise.all([
      prisma.coachProfile.count(),
      prisma.user.count(),
      prisma.coachProfile.count({ where: { verified: true } }),
      prisma.coachProfile.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

  const stats = [
    {
      title: 'Total Coaches',
      value: totalCoaches,
      icon: Users,
      description: 'Total coach profiles',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Verified Coaches',
      value: verifiedCoaches,
      icon: UserCheck,
      description: 'Verified profiles',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Users',
      value: totalUsers,
      icon: TrendingUp,
      description: 'Registered users',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Recent Additions',
      value: recentCoaches,
      icon: Calendar,
      description: 'Added in last 7 days',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <AdminLayout>
      <div className='space-y-8'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Dashboard</h1>
          <p className='mt-2 text-muted-foreground'>
            Overview of your coach database
          </p>
        </div>

        {/* Stats Grid */}
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className='group overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5'
              >
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium text-card-foreground'>
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.bgColor} p-2 rounded-lg`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-foreground'>
                    {stat.value}
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className='overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20'>
          <CardHeader>
            <CardTitle className='text-foreground'>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4 md:grid-cols-3'>
            <Link
              href='/admin/coaches/new'
              className='group flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 text-center transition-all duration-300 hover:border-primary hover:bg-primary/5'
            >
              <Users className='mb-2 h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors' />
              <span className='font-medium text-foreground group-hover:text-primary transition-colors'>
                Add New Coach
              </span>
            </Link>
            <Link
              href='/admin/import'
              className='group flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 text-center transition-all duration-300 hover:border-primary hover:bg-primary/5'
            >
              <TrendingUp className='mb-2 h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors' />
              <span className='font-medium text-foreground group-hover:text-primary transition-colors'>
                Import from Instagram
              </span>
            </Link>
            <Link
              href='/admin/coaches'
              className='group flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 text-center transition-all duration-300 hover:border-primary hover:bg-primary/5'
            >
              <Calendar className='mb-2 h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors' />
              <span className='font-medium text-foreground group-hover:text-primary transition-colors'>
                View All Coaches
              </span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
