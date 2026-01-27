import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin/auth';
import AdminLayout from '@/components/admin/AdminLayout';
import InstagramImportForm from '@/components/admin/InstagramImportForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Instagram, Zap, Database } from 'lucide-react';

export default async function ImportPage() {
    const admin = await isAdmin();

    if (!admin) {
        redirect('/');
    }

    return (
        <AdminLayout>
            <div className='space-y-6'>
                {/* Header */}
                <div>
                    <h1 className='text-3xl font-bold text-gray-900'>
                        Import from Instagram
                    </h1>
                    <p className='mt-2 text-gray-600'>
                        Automatically import coach profiles from Instagram using web scraping
                    </p>
                </div>

                {/* Info Cards */}
                <div className='grid gap-4 md:grid-cols-3'>
                    <Card>
                        <CardHeader className='flex flex-row items-center space-y-0 pb-2'>
                            <Instagram className='h-5 w-5 text-pink-600 mr-2' />
                            <CardTitle className='text-sm font-medium'>
                                Instagram Scraping
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className='text-xs text-gray-600'>
                                Automatically fetch profile data including followers, posts, bio, and more
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className='flex flex-row items-center space-y-0 pb-2'>
                            <Zap className='h-5 w-5 text-yellow-600 mr-2' />
                            <CardTitle className='text-sm font-medium'>
                                Bulk Import
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className='text-xs text-gray-600'>
                                Import multiple profiles at once by providing a list of usernames
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className='flex flex-row items-center space-y-0 pb-2'>
                            <Database className='h-5 w-5 text-blue-600 mr-2' />
                            <CardTitle className='text-sm font-medium'>
                                Auto-Save
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className='text-xs text-gray-600'>
                                Profiles are automatically saved to the database after import
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Import Form */}
                <InstagramImportForm />

                {/* Instructions */}
                <Card>
                    <CardHeader>
                        <CardTitle>How It Works</CardTitle>
                        <CardDescription>
                            Follow these steps to import Instagram profiles
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                        <div className='flex gap-3'>
                            <div className='flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium'>
                                1
                            </div>
                            <div>
                                <p className='font-medium'>Enter Instagram Username(s)</p>
                                <p className='text-sm text-gray-600'>
                                    Provide the Instagram username without the @ symbol
                                </p>
                            </div>
                        </div>

                        <div className='flex gap-3'>
                            <div className='flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium'>
                                2
                            </div>
                            <div>
                                <p className='font-medium'>Automatic Scraping</p>
                                <p className='text-sm text-gray-600'>
                                    The system will scrape the profile data from Instagram using Bright Data or similar service
                                </p>
                            </div>
                        </div>

                        <div className='flex gap-3'>
                            <div className='flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium'>
                                3
                            </div>
                            <div>
                                <p className='font-medium'>Profile Creation</p>
                                <p className='text-sm text-gray-600'>
                                    A coach profile is automatically created in the database with all the scraped data
                                </p>
                            </div>
                        </div>

                        <div className='flex gap-3'>
                            <div className='flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium'>
                                4
                            </div>
                            <div>
                                <p className='font-medium'>Review and Edit</p>
                                <p className='text-sm text-gray-600'>
                                    You can review and edit the imported profiles in the Coaches section
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
