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
                // Fetch profile from Instagram
                const profileData = await provider.fetchProfile(username);

                if (!profileData) {
                    results.failed.push({
                        username,
                        error: 'Profile not found or could not be scraped',
                    });
                    continue;
                }

                // Save to database (upsert to handle duplicates)
                await prisma.coachProfile.upsert({
                    where: { id: profileData.id },
                    create: {
                        id: profileData.id,
                        username: profileData.username,
                        fullName: profileData.fullName,
                        profilePicture: profileData.profilePicture,
                        profilePicUrl: profileData.profilePicture,
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
                        isPartial: profileData.isPartial || false,
                    },
                    update: {
                        fullName: profileData.fullName,
                        profilePicture: profileData.profilePicture,
                        profilePicUrl: profileData.profilePicture,
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
                    },
                });

                results.success.push(username);

                // Add a small delay to avoid rate limiting
                await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (error) {
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
