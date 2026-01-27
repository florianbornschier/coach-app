'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Upload, Instagram, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function InstagramImportForm() {
    const [loading, setLoading] = useState(false);
    const [importType, setImportType] = useState<'single' | 'bulk'>('single');
    const [username, setUsername] = useState('');
    const [usernames, setUsernames] = useState('');
    const [results, setResults] = useState<any>(null);

    const handleSingleImport = async () => {
        if (!username.trim()) {
            toast.error('Please enter a username');
            return;
        }

        try {
            setLoading(true);
            setResults(null);

            const response = await fetch('/api/instagram/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim() }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to import profile');
            }

            const data = await response.json();
            setResults(data);
            toast.success(`Successfully imported @${username}`);
            setUsername('');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Import failed');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkImport = async () => {
        const usernameList = usernames
            .split('\n')
            .map((u) => u.trim())
            .filter((u) => u.length > 0);

        if (usernameList.length === 0) {
            toast.error('Please enter at least one username');
            return;
        }

        try {
            setLoading(true);
            setResults(null);

            const response = await fetch('/api/instagram/bulk-scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: usernameList }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to import profiles');
            }

            const data = await response.json();
            setResults(data);
            toast.success(`Successfully imported ${data.success?.length || 0} profiles`);
            setUsernames('');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Import failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='space-y-6'>
            {/* Import Type Selection */}
            <div className='flex gap-4'>
                <Button
                    variant={importType === 'single' ? 'default' : 'outline'}
                    onClick={() => setImportType('single')}
                >
                    Single Import
                </Button>
                <Button
                    variant={importType === 'bulk' ? 'default' : 'outline'}
                    onClick={() => setImportType('bulk')}
                >
                    Bulk Import
                </Button>
            </div>

            {/* Import Form */}
            {importType === 'single' ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Import Single Profile</CardTitle>
                        <CardDescription>
                            Enter an Instagram username to import their profile data
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div>
                            <Label htmlFor='username'>Instagram Username</Label>
                            <div className='flex gap-2 mt-2'>
                                <div className='relative flex-1'>
                                    <Instagram className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                                    <Input
                                        id='username'
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder='username (without @)'
                                        className='pl-10'
                                        onKeyPress={(e) => e.key === 'Enter' && handleSingleImport()}
                                    />
                                </div>
                                <Button onClick={handleSingleImport} disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                            Importing...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className='mr-2 h-4 w-4' />
                                            Import
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <Alert>
                            <AlertCircle className='h-4 w-4' />
                            <AlertDescription>
                                This will scrape the Instagram profile and automatically create a coach
                                profile in the database.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Bulk Import Profiles</CardTitle>
                        <CardDescription>
                            Enter multiple Instagram usernames (one per line) to import them all at once
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div>
                            <Label htmlFor='usernames'>Instagram Usernames</Label>
                            <Textarea
                                id='usernames'
                                value={usernames}
                                onChange={(e) => setUsernames(e.target.value)}
                                placeholder={'username1\nusername2\nusername3'}
                                rows={10}
                                className='mt-2 font-mono'
                            />
                            <p className='text-sm text-gray-500 mt-2'>
                                {usernames.split('\n').filter((u) => u.trim().length > 0).length} usernames
                            </p>
                        </div>

                        <Button onClick={handleBulkImport} disabled={loading} className='w-full'>
                            {loading ? (
                                <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Upload className='mr-2 h-4 w-4' />
                                    Import All
                                </>
                            )}
                        </Button>

                        <Alert>
                            <AlertCircle className='h-4 w-4' />
                            <AlertDescription>
                                Bulk imports may take several minutes depending on the number of profiles.
                                Please be patient.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}

            {/* Results */}
            {results && (
                <Card>
                    <CardHeader>
                        <CardTitle>Import Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {importType === 'single' ? (
                            <div className='space-y-2'>
                                <p className='text-green-600 font-medium'>
                                    ✓ Successfully imported @{results.username}
                                </p>
                                <div className='text-sm text-gray-600'>
                                    <p>Followers: {results.followersCount?.toLocaleString()}</p>
                                    <p>Posts: {results.postsCount?.toLocaleString()}</p>
                                </div>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                {results.success && results.success.length > 0 && (
                                    <div>
                                        <p className='font-medium text-green-600 mb-2'>
                                            ✓ Successfully imported ({results.success.length}):
                                        </p>
                                        <ul className='text-sm text-gray-600 space-y-1'>
                                            {results.success.map((username: string) => (
                                                <li key={username}>@{username}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {results.failed && results.failed.length > 0 && (
                                    <div>
                                        <p className='font-medium text-red-600 mb-2'>
                                            ✗ Failed to import ({results.failed.length}):
                                        </p>
                                        <ul className='text-sm text-gray-600 space-y-1'>
                                            {results.failed.map((item: any) => (
                                                <li key={item.username}>
                                                    @{item.username}: {item.error}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
