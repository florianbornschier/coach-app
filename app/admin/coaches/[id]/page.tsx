import { redirect, notFound } from 'next/navigation';
import { isAdmin } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Edit, Trash2, ExternalLink, Mail, Phone, Globe } from 'lucide-react';
import Image from 'next/image';

export default async function CoachViewPage({
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
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-3xl font-bold text-gray-900'>
                            Coach Profile: @{coach.username}
                        </h1>
                        <p className='mt-2 text-gray-600'>
                            View and manage coach details
                        </p>
                    </div>
                    <div className='flex gap-2'>
                        <Link href={`/admin/coaches/${coach.id}/edit`}>
                            <Button>
                                <Edit className='mr-2 h-4 w-4' />
                                Edit
                            </Button>
                        </Link>
                        <Button variant='destructive'>
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className='grid gap-6 md:grid-cols-2'>
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            {coach.profilePicUrl && (
                                <div className='flex justify-center'>
                                    <Image
                                        src={coach.profilePicUrl}
                                        alt={coach.fullName || coach.username}
                                        width={120}
                                        height={120}
                                        className='rounded-full'
                                    />
                                </div>
                            )}

                            <div>
                                <p className='text-sm font-medium text-gray-500'>Username</p>
                                <p className='mt-1 text-lg'>@{coach.username}</p>
                            </div>

                            {coach.fullName && (
                                <div>
                                    <p className='text-sm font-medium text-gray-500'>Full Name</p>
                                    <p className='mt-1'>{coach.fullName}</p>
                                </div>
                            )}

                            {coach.niche && (
                                <div>
                                    <p className='text-sm font-medium text-gray-500'>Niche</p>
                                    <Badge variant='secondary' className='mt-1'>
                                        {coach.niche}
                                    </Badge>
                                </div>
                            )}

                            <div className='flex gap-2'>
                                {coach.verified && (
                                    <Badge variant='default'>Verified</Badge>
                                )}
                                {coach.isBusinessAccount && (
                                    <Badge variant='outline'>Business</Badge>
                                )}
                                {coach.isProfessionalAccount && (
                                    <Badge variant='outline'>Professional</Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Social Media Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Social Media Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='grid grid-cols-3 gap-4 text-center'>
                                <div>
                                    <p className='text-2xl font-bold text-blue-600'>
                                        {coach.followersCount.toLocaleString()}
                                    </p>
                                    <p className='text-sm text-gray-500'>Followers</p>
                                </div>
                                <div>
                                    <p className='text-2xl font-bold text-green-600'>
                                        {coach.followsCount.toLocaleString()}
                                    </p>
                                    <p className='text-sm text-gray-500'>Following</p>
                                </div>
                                <div>
                                    <p className='text-2xl font-bold text-purple-600'>
                                        {coach.postsCount.toLocaleString()}
                                    </p>
                                    <p className='text-sm text-gray-500'>Posts</p>
                                </div>
                            </div>

                            <div className='pt-4 border-t'>
                                <p className='text-sm font-medium text-gray-500'>
                                    Engagement Rate
                                </p>
                                <p className='mt-1 text-lg'>
                                    {coach.followersCount > 0
                                        ? ((coach.postsCount / coach.followersCount) * 100).toFixed(2)
                                        : 0}
                                    %
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bio and Description */}
                    {(coach.bio || coach.biography) && (
                        <Card className='md:col-span-2'>
                            <CardHeader>
                                <CardTitle>Bio and Description</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                {coach.bio && (
                                    <div>
                                        <p className='text-sm font-medium text-gray-500'>Short Bio</p>
                                        <p className='mt-1 text-gray-700'>{coach.bio}</p>
                                    </div>
                                )}
                                {coach.biography && (
                                    <div>
                                        <p className='text-sm font-medium text-gray-500'>
                                            Detailed Biography
                                        </p>
                                        <p className='mt-1 text-gray-700 whitespace-pre-wrap'>
                                            {coach.biography}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Career Information */}
                    {(coach.careerPageUrl ||
                        coach.contactEmail ||
                        coach.contactPhone ||
                        coach.applicationUrl) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Career Information</CardTitle>
                                </CardHeader>
                                <CardContent className='space-y-3'>
                                    {coach.careerPageUrl && (
                                        <div className='flex items-center gap-2'>
                                            <Globe className='h-4 w-4 text-gray-500' />
                                            <a
                                                href={coach.careerPageUrl}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='text-blue-600 hover:underline flex items-center gap-1'
                                            >
                                                Career Page
                                                <ExternalLink className='h-3 w-3' />
                                            </a>
                                        </div>
                                    )}
                                    {coach.contactEmail && (
                                        <div className='flex items-center gap-2'>
                                            <Mail className='h-4 w-4 text-gray-500' />
                                            <a
                                                href={`mailto:${coach.contactEmail}`}
                                                className='text-blue-600 hover:underline'
                                            >
                                                {coach.contactEmail}
                                            </a>
                                        </div>
                                    )}
                                    {coach.contactPhone && (
                                        <div className='flex items-center gap-2'>
                                            <Phone className='h-4 w-4 text-gray-500' />
                                            <a
                                                href={`tel:${coach.contactPhone}`}
                                                className='text-blue-600 hover:underline'
                                            >
                                                {coach.contactPhone}
                                            </a>
                                        </div>
                                    )}
                                    {coach.applicationUrl && (
                                        <div className='flex items-center gap-2'>
                                            <ExternalLink className='h-4 w-4 text-gray-500' />
                                            <a
                                                href={coach.applicationUrl}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='text-blue-600 hover:underline'
                                            >
                                                Application Form
                                            </a>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                    {/* Ads Tracking */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ads Tracking</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                            <div>
                                <p className='text-sm font-medium text-gray-500'>Status</p>
                                <Badge
                                    variant={coach.isRunningAds ? 'destructive' : 'outline'}
                                    className='mt-1'
                                >
                                    {coach.isRunningAds ? 'Running Ads' : 'No Active Ads'}
                                </Badge>
                            </div>

                            {coach.metaAdsLibraryUrl && (
                                <div>
                                    <p className='text-sm font-medium text-gray-500'>
                                        Meta Ads Library
                                    </p>
                                    <a
                                        href={coach.metaAdsLibraryUrl}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-blue-600 hover:underline text-sm flex items-center gap-1 mt-1'
                                    >
                                        View Ads
                                        <ExternalLink className='h-3 w-3' />
                                    </a>
                                </div>
                            )}

                            {coach.googleAdsLibraryUrl && (
                                <div>
                                    <p className='text-sm font-medium text-gray-500'>
                                        Google Ads Library
                                    </p>
                                    <a
                                        href={coach.googleAdsLibraryUrl}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-blue-600 hover:underline text-sm flex items-center gap-1 mt-1'
                                    >
                                        View Ads
                                        <ExternalLink className='h-3 w-3' />
                                    </a>
                                </div>
                            )}

                            {coach.lastAdsCheck && (
                                <div>
                                    <p className='text-sm font-medium text-gray-500'>
                                        Last Checked
                                    </p>
                                    <p className='mt-1 text-sm'>
                                        {new Date(coach.lastAdsCheck).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Tags and Notes */}
                    {(coach.tags?.length || coach.notes) && (
                        <Card className='md:col-span-2'>
                            <CardHeader>
                                <CardTitle>Tags and Notes</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                {coach.tags && coach.tags.length > 0 && (
                                    <div>
                                        <p className='text-sm font-medium text-gray-500 mb-2'>Tags</p>
                                        <div className='flex flex-wrap gap-2'>
                                            {coach.tags.map((tag) => (
                                                <Badge key={tag} variant='secondary'>
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {coach.notes && (
                                    <div>
                                        <p className='text-sm font-medium text-gray-500'>
                                            Internal Notes
                                        </p>
                                        <p className='mt-1 text-gray-700 whitespace-pre-wrap'>
                                            {coach.notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Metadata */}
                    <Card className='md:col-span-2'>
                        <CardHeader>
                            <CardTitle>Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className='grid grid-cols-3 gap-4'>
                            <div>
                                <p className='text-sm font-medium text-gray-500'>Created At</p>
                                <p className='mt-1 text-sm'>
                                    {new Date(coach.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className='text-sm font-medium text-gray-500'>Updated At</p>
                                <p className='mt-1 text-sm'>
                                    {new Date(coach.updatedAt).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className='text-sm font-medium text-gray-500'>Last Fetched</p>
                                <p className='mt-1 text-sm'>
                                    {new Date(coach.lastFetched).toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
