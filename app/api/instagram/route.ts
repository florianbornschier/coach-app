import { NextRequest, NextResponse } from 'next/server';
import { getInstagramProvider } from '@/lib/providers';

/**
 * API Route to fetch Instagram profile data
 * POST /api/instagram
 * Body: { username: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const provider = getInstagramProvider();
    const profile = await provider.fetchProfile(username);

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found or not a German account' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in Instagram API route:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to fetch multiple profiles
 * GET /api/instagram?usernames=user1,user2,user3
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const usernamesParam = searchParams.get('usernames');

    if (!usernamesParam) {
      return NextResponse.json(
        { error: 'usernames query parameter is required' },
        { status: 400 }
      );
    }

    const usernames = usernamesParam.split(',').map((u) => u.trim());

    if (usernames.length === 0) {
      return NextResponse.json(
        { error: 'At least one username is required' },
        { status: 400 }
      );
    }

    const provider = getInstagramProvider();
    
    // For Bright Data, we need to get profiles with related accounts separately
    // Check if the provider has the fetchProfileWithRelated method (Bright Data only)
    const providerAny = provider as any;
    const hasRelatedAccountsMethod = typeof providerAny.fetchProfileWithRelated === 'function';
    
    if (hasRelatedAccountsMethod) {
      // Use the internal method to get profiles with related accounts
      const mainProfiles: any[] = [];
      const relatedAccounts: any[] = [];
      const processedUsernames = new Set<string>();
      
      for (const username of usernames) {
        try {
          const { profile, relatedAccounts: related } = await providerAny.fetchProfileWithRelated(username);
          
          if (profile) {
            mainProfiles.push(profile);
            processedUsernames.add(profile.username.toLowerCase());
          }
          
          // Add related accounts (avoid duplicates)
          for (const relatedAccount of related) {
            const usernameKey = relatedAccount.username.toLowerCase();
            if (!processedUsernames.has(usernameKey)) {
              relatedAccounts.push(relatedAccount);
              processedUsernames.add(usernameKey);
            }
          }
          
          // Small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error fetching ${username}:`, error);
        }
      }
      
      return NextResponse.json({ 
        profiles: mainProfiles, 
        relatedAccounts: relatedAccounts,
        count: mainProfiles.length,
        relatedCount: relatedAccounts.length
      });
    } else {
      // For other providers, use the standard method
      const profiles = await provider.fetchProfiles(usernames);
      return NextResponse.json({ 
        profiles, 
        relatedAccounts: [],
        count: profiles.length,
        relatedCount: 0
      });
    }
  } catch (error) {
    console.error('Error in Instagram API route:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
