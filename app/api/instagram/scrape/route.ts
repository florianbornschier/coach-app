import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import { getInstagramProvider } from '@/lib/providers';

/**
 * POST /api/instagram/scrape
 * Scrape a single Instagram profile and save it to the database
 */
export async function POST(request: NextRequest) {
    try {
        await requireAdmin();

        const body = await request.json();
        const { username } = body;

        if (!username || typeof username !== 'string') {
            return NextResponse.json(
                { error: 'Username is required' },
                { status: 400 }
            );
        }

        // Fetch profile from Instagram
        const provider = getInstagramProvider();
        const profileData = await provider.fetchProfile(username);

        if (!profileData) {
            return NextResponse.json(
                { error: 'Profile not found or could not be scraped' },
                { status: 404 }
            );
        }

        // Save to database (upsert to handle duplicates)
        const coach = await prisma.coachProfile.upsert({
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

        return NextResponse.json(coach);
    } catch (error) {
        console.error('Error scraping Instagram profile:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to scrape profile',
            },
            { status: 500 }
        );
    }
}
