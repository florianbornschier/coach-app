import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import { getInstagramProvider } from '@/lib/providers';
import { CoachProfile } from '@/lib/types';

/**
 * POST /api/instagram/scrape
 * Scrape a single Instagram profile and save it to the database
 */
export async function POST(request: NextRequest) {
    try {
        console.log('Starting single profile scrape...');
        await requireAdmin();

        const body = await request.json();
        const { username } = body;

        if (!username || typeof username !== 'string') {
            return NextResponse.json(
                { error: 'Username is required' },
                { status: 400 }
            );
        }

        console.log(`Scraping @${username}...`);

        // Check if profile exists and was fetched within the last 30 days (reduced from 6 months for better accuracy)
        const existingCoach = await prisma.coachProfile.findUnique({
            where: { username: username.toLowerCase() },
        });

        if (existingCoach && existingCoach.lastFetched) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            if (existingCoach.lastFetched > thirtyDaysAgo) {
                console.log(`Using recently cached data for @${username}`);
                return NextResponse.json(existingCoach);
            }
        }

        // Fetch profile from Instagram
        const provider = getInstagramProvider();
        let profileData: CoachProfile | null = null;

        try {
            profileData = await provider.fetchProfile(username);
        } catch (fetchError) {
            console.error(`Provider fetch error for @${username}:`, fetchError);
            return NextResponse.json(
                { error: fetchError instanceof Error ? fetchError.message : 'Failed to fetch from Instagram' },
                { status: 502 }
            );
        }

        if (!profileData) {
            console.warn(`Profile @${username} not found or skipped by filters`);
            return NextResponse.json(
                { error: 'Profile not found or does not meet criteria (Must be a German account)' },
                { status: 404 }
            );
        }

        console.log(`Saving @${username} to database...`);

        // Save to database (upsert to handle updates)
        const coach = await prisma.coachProfile.upsert({
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

        console.log(`Successfully saved @${username}`);
        return NextResponse.json(coach);
    } catch (error) {
        console.error('CRITICAL: Error in scrape API:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to scrape profile',
                details: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
