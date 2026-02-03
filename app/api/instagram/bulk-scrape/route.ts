import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import { getInstagramProvider } from '@/lib/providers';

/**
 * POST /api/instagram/bulk-scrape
 * Scrape multiple Instagram profiles and save them to the database
 */
export async function POST(request: NextRequest) {
    try {
        await requireAdmin();

        const body = await request.json();
        const { usernames } = body;

        if (!Array.isArray(usernames) || usernames.length === 0) {
            return NextResponse.json(
                { error: 'Usernames array is required' },
                { status: 400 }
            );
        }

        const provider = getInstagramProvider();
        const results = {
            success: [] as string[],
            failed: [] as { username: string; error: string }[],
        };

        // Process each username
        for (const username of usernames) {
            try {
                console.log(`[Bulk] Processing @${username}...`);

                // Check if profile exists and was fetched within the last 30 days
                const existingCoach = await prisma.coachProfile.findUnique({
                    where: { username: username.toLowerCase() },
                });

                if (existingCoach && existingCoach.lastFetched) {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                    if (existingCoach.lastFetched > thirtyDaysAgo) {
                        console.log(`[Bulk] Using recently cached data for @${username}`);
                        results.success.push(username);
                        continue;
                    }
                }

                // Fetch profile from Instagram
                const profileData = await provider.fetchProfile(username);

                if (!profileData) {
                    console.warn(`[Bulk] Profile @${username} not found or skipped`);
                    results.failed.push({
                        username,
                        error: 'Profile not found or does not meet criteria (Must be a German account)',
                    });
                    continue;
                }

                // Save to database
                await prisma.coachProfile.upsert({
                    where: { id: profileData.id },
                    create: {
                        id: profileData.id,
                        username: profileData.username.toLowerCase(),
                        fullName: profileData.fullName,
                        profilePicture: profileData.profilePicture,
                        profilePicUrl: profileData.profilePicUrl,
                        bio: profileData.bio,
                        biography: profileData.biography,
                        externalUrls: profileData.externalUrls,
                        followersCount: profileData.followersCount,
                        followsCount: profileData.followsCount,
                        postsCount: profileData.postsCount,
                        isBusinessAccount: profileData.isBusinessAccount,
                        isProfessionalAccount: profileData.isProfessionalAccount,
                        niche: profileData.niche,
                        verified: profileData.verified,
                        isPartial: false,
                        lastFetched: new Date(),
                    },
                    update: {
                        username: profileData.username.toLowerCase(),
                        fullName: profileData.fullName,
                        profilePicture: profileData.profilePicture,
                        profilePicUrl: profileData.profilePicUrl,
                        bio: profileData.bio,
                        biography: profileData.biography,
                        externalUrls: profileData.externalUrls,
                        followersCount: profileData.followersCount,
                        followsCount: profileData.followsCount,
                        postsCount: profileData.postsCount,
                        isBusinessAccount: profileData.isBusinessAccount,
                        isProfessionalAccount: profileData.isProfessionalAccount,
                        niche: profileData.niche,
                        verified: profileData.verified,
                        lastFetched: new Date(),
                        isPartial: false,
                    },
                });

                results.success.push(username);
                console.log(`[Bulk] Successfully imported @${username}`);

                // Add a small delay to avoid rate limiting
                await new Promise((resolve) => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`[Bulk] Error processing @${username}:`, error);
                results.failed.push({
                    username,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error('Error in bulk scrape:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to bulk scrape',
            },
            { status: 500 }
        );
    }
}
