import { InstagramProvider } from './base-provider';
import { CoachProfile } from '../types';
import { isGermanAccount, detectNicheFromBio } from '../instagram-api';
import { uploadProfilePicture } from '../storage';

/**
 * Bright Data API Response Interface
 */
interface BrightDataResponse {
  account?: string;
  id: string;
  followers: number;
  posts_count: number;
  is_business_account: boolean;
  is_professional_account: boolean;
  is_verified: boolean;
  biography?: string;
  full_name?: string;
  profile_image_link?: string;
  profile_url?: string;
  following?: number;
  is_private?: boolean;
  external_url?: string[];
  business_category_name?: string;
  related_accounts?: RelatedAccount[];
}

interface RelatedAccount {
  id: string;
  user_name?: string;
  profile_name?: string;
  profile_pic_url?: string;
  is_private?: boolean;
  is_verified?: boolean;
}

/**
 * Bright Data API Provider Implementation
 */
export class BrightDataProvider implements InstagramProvider {
  private apiKey: string;
  private datasetId: string;

  constructor(apiKey: string, datasetId?: string) {
    this.apiKey = apiKey;
    // Default dataset ID - you can override this via env variable
    this.datasetId =
      datasetId || process.env.BRIGHT_DATA_DATASET_ID || 'gd_l1vikfch901nx3by4';
  }

  private mapDbProfileToCoachProfile(dbProfile: any): CoachProfile {
    return {
      id: dbProfile.id,
      username: dbProfile.username,
      fullName: dbProfile.fullName,
      profilePicture: dbProfile.profilePicture || '',
      bio: dbProfile.bio,
      biography: dbProfile.biography,
      externalUrls: dbProfile.externalUrls,
      followersCount: dbProfile.followersCount,
      followsCount: dbProfile.followsCount,
      postsCount: dbProfile.postsCount,
      isBusinessAccount: dbProfile.isBusinessAccount,
      isProfessionalAccount: dbProfile.isProfessionalAccount,
      profilePicUrl: dbProfile.profilePicUrl,
      niche: dbProfile.niche || 'Lifestyle',
      verified: dbProfile.verified,
      isPartial: dbProfile.isPartial,
    };
  }

  async fetchProfile(username: string): Promise<CoachProfile | null> {
    try {
      const { db } = await import('@/lib/db');

      // 1. Check Database first
      try {
        const existingProfile = await db.coachProfile.findUnique({
          where: { username },
        });

        // 2. Check if data is fresh (< 6 months old) and NOT partial
        if (existingProfile) {
          // If profile is partial, we treat it as missing/stale because we need full data
          if (existingProfile.isPartial) {
            console.log(
              `Cached profile for ${username} is partial, fetching full data...`,
            );
          } else {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            if (existingProfile.lastFetched > sixMonthsAgo) {
              console.log(`Using cached profile for ${username}`);
              return this.mapDbProfileToCoachProfile(existingProfile);
            }
            console.log(
              `Cached profile for ${username} is stale, refreshing...`,
            );
          }
        }
      } catch (dbError) {
        console.error(
          `DB Error checking cache for ${username} (continuing to fetch):`,
          dbError,
        );
      }

      // 3. Fetch from API if missing or stale
      const response = await fetch(
        `https://api.brightdata.com/datasets/v3/scrape?dataset_id=${this.datasetId}&notify=false&include_errors=true&type=discover_new&discover_by=user_name`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: [{ user_name: username }],
          }),
        },
      );

      // Read response text first (can only read once)
      const responseText = await response.text();

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `API error: ${response.status} ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage =
            errorData.message ||
            errorData.error ||
            errorData.detail ||
            errorMessage;
          console.error('Bright Data API error:', errorData);
        } catch {
          // If we can't parse error, log raw response
          console.error('Bright Data API error (raw):', responseText);
        }

        if (response.status === 404) {
          console.warn(`Profile not found: ${username}`);
          return null;
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(errorMessage);
      }

      // Parse the response
      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch (error) {
        console.error('Failed to parse Bright Data response:', responseText);
        throw new Error('Invalid JSON response from Bright Data API');
      }

      // Bright Data might return an array or an object with errors
      if (!responseData) {
        console.warn(`No data returned for ${username}`);
        return null;
      }

      // Check if response is an error object (but not if it has id/account which means it's valid data)
      if (
        (responseData.error || responseData.message) &&
        !responseData.id &&
        !responseData.account
      ) {
        console.error('Bright Data error response:', responseData);
        return null;
      }

      // Bright Data can return either an array or a single object
      let profileData: BrightDataResponse;

      if (Array.isArray(responseData)) {
        if (responseData.length === 0) {
          console.warn(`No profile data returned for ${username}`);
          return null;
        }
        profileData = responseData[0];
      } else if (responseData.id || responseData.account) {
        // Single object response - use it directly
        profileData = responseData as BrightDataResponse;

        console.log('Profile Data: ', profileData);
      } else {
        console.warn(
          `Unexpected response format for ${username}:`,
          typeof responseData,
          Object.keys(responseData || {}),
        );
        return null;
      }

      if (!profileData) {
        console.warn(`Profile data is null/undefined for ${username}`);
        return null;
      }

      // Skip private accounts
      if (profileData.is_private) {
        return null;
      }

      // Check if account is German
      if (!isGermanAccount(profileData.biography, profileData.full_name)) {
        return null; // Skip non-German accounts
      }

      // Map Bright Data response to CoachProfile
      const detectedNiche = detectNicheFromBio(
        profileData.biography,
        profileData.full_name,
      );

      // Extract profile image URL (may be obfuscated in response)
      // Bright Data obfuscates URLs with asterisks, we need to reconstruct or use profile_url
      let profilePicUrl: string | undefined;
      if (profileData.profile_image_link) {
        // Try to reconstruct URL by replacing asterisks
        const tempUrl = profileData.profile_image_link.replace(/\*/g, '');
        // If still invalid, try to get from profile_url
        if (tempUrl.startsWith('http')) {
          profilePicUrl = tempUrl;
        }
      }

      // Extract username from account field (may be obfuscated)
      const extractedUsername = profileData.account
        ? profileData.account.replace(/\*/g, '')
        : username;

      // Upload profile picture to Supabase Storage for permanent URL
      let permanentProfilePicUrl: string | undefined;
      if (profilePicUrl) {
        try {
          const uploadedUrl = await uploadProfilePicture(
            profilePicUrl,
            extractedUsername,
          );
          if (uploadedUrl) {
            permanentProfilePicUrl = uploadedUrl;
            console.log(
              `Uploaded profile picture for ${extractedUsername} to Supabase Storage`,
            );
          } else {
            // Fallback to original URL if upload fails
            permanentProfilePicUrl = profilePicUrl;
            console.warn(
              `Failed to upload profile picture for ${extractedUsername}, using original URL`,
            );
          }
        } catch (error) {
          console.error(
            `Error uploading profile picture for ${extractedUsername}:`,
            error,
          );
          permanentProfilePicUrl = profilePicUrl; // Fallback
        }
      }

      const mainProfile: CoachProfile = {
        id: profileData.id || username,
        username: extractedUsername || username,
        fullName: profileData.full_name,
        profilePicture: permanentProfilePicUrl || '',
        bio: profileData.biography,
        biography: profileData.biography,
        externalUrls: profileData.external_url?.[0],
        followersCount: profileData.followers || 0,
        followsCount: profileData.following || 0,
        postsCount: profileData.posts_count || 0,
        isBusinessAccount: profileData.is_business_account || false,
        isProfessionalAccount: profileData.is_professional_account || false,
        profilePicUrl: permanentProfilePicUrl,
        niche: detectedNiche,
        verified: profileData.is_verified || false,
      };

      // 4. Save to Database
      await this.saveProfileToDb(mainProfile, profileData.related_accounts);

      return mainProfile;
    } catch (error) {
      console.error(`Error fetching profile for ${username}:`, error);
      throw error;
    }
  }

  private async saveProfileToDb(
    profile: CoachProfile,
    relatedAccounts?: RelatedAccount[],
  ) {
    try {
      const { db } = await import('@/lib/db');

      // Upsert main profile
      await db.coachProfile.upsert({
        where: { username: profile.username },
        update: {
          fullName: profile.fullName,
          profilePicture: profile.profilePicture,
          bio: profile.bio,
          biography: profile.biography,
          externalUrls: profile.externalUrls,
          followersCount: profile.followersCount,
          followsCount: profile.followsCount,
          postsCount: profile.postsCount,
          isBusinessAccount: profile.isBusinessAccount,
          isProfessionalAccount: profile.isProfessionalAccount,
          profilePicUrl: profile.profilePicUrl,
          niche: profile.niche,
          verified: profile.verified,
          lastFetched: new Date(),
          isPartial: false, // This is a full profile
        },
        create: {
          id: profile.id,
          username: profile.username,
          fullName: profile.fullName,
          profilePicture: profile.profilePicture,
          bio: profile.bio,
          biography: profile.biography,
          externalUrls: profile.externalUrls,
          followersCount: profile.followersCount,
          followsCount: profile.followsCount,
          postsCount: profile.postsCount,
          isBusinessAccount: profile.isBusinessAccount,
          isProfessionalAccount: profile.isProfessionalAccount,
          profilePicUrl: profile.profilePicUrl,
          niche: profile.niche,
          verified: profile.verified,
          lastFetched: new Date(),
          isPartial: false, // This is a full profile
        },
      });

      // Related accounts saving logic removed as per requirement.
      // Only the main profile is saved.
    } catch (error) {
      console.error(`Error caching profile ${profile.username} to DB:`, error);
      // Don't throw, just log error so we still return the API data
    }
  }

  /**
   * Map related account to CoachProfile
   */
  private mapRelatedAccountToProfile(
    relatedAccount: RelatedAccount,
  ): CoachProfile | null {
    // Skip private accounts
    if (relatedAccount.is_private) {
      return null;
    }

    // Extract username (may be obfuscated)
    const username = relatedAccount.user_name
      ? relatedAccount.user_name.replace(/\*/g, '')
      : '';

    if (!username) {
      return null;
    }

    // Extract profile picture URL (may be obfuscated)
    let profilePicUrl: string | undefined;
    if (relatedAccount.profile_pic_url) {
      profilePicUrl = relatedAccount.profile_pic_url.replace(/\*/g, '');
      if (!profilePicUrl.startsWith('http')) {
        profilePicUrl = undefined;
      }
    }

    // Extract profile name (may be obfuscated)
    const fullName = relatedAccount.profile_name
      ? relatedAccount.profile_name.replace(/\*/g, '')
      : undefined;

    // Check if account is German (we don't have bio for related accounts, so check name)
    if (!isGermanAccount(undefined, fullName)) {
      return null; // Skip non-German accounts
    }

    // Detect niche from profile name
    const detectedNiche = detectNicheFromBio(undefined, fullName);

    return {
      id: relatedAccount.id || username,
      username: username,
      fullName: fullName,
      profilePicture: profilePicUrl || '',
      bio: undefined, // Related accounts don't have bio in the response
      biography: undefined,
      externalUrls: undefined,
      followersCount: 0, // Not available in related_accounts
      followsCount: 0,
      postsCount: 0,
      isBusinessAccount: false,
      isProfessionalAccount: false,
      profilePicUrl: profilePicUrl,
      niche: detectedNiche,
      verified: relatedAccount.is_verified || false,
    };
  }

  /**
   * Fetch profile and extract related accounts
   */
  private async fetchProfileWithRelated(username: string): Promise<{
    profile: CoachProfile | null;
    relatedAccounts: CoachProfile[];
  }> {
    try {
      const response = await fetch(
        `https://api.brightdata.com/datasets/v3/scrape?dataset_id=${this.datasetId}&notify=false&include_errors=true&type=discover_new&discover_by=user_name`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: [{ user_name: username }],
          }),
        },
      );

      // Read response text first (can only read once)
      const responseText = await response.text();

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `API error: ${response.status} ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage =
            errorData.message ||
            errorData.error ||
            errorData.detail ||
            errorMessage;
          console.error('Bright Data API error:', errorData);
        } catch {
          // If we can't parse error, log raw response
          console.error('Bright Data API error (raw):', responseText);
        }

        if (response.status === 404) {
          console.warn(`Profile not found: ${username}`);
          return { profile: null, relatedAccounts: [] };
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(errorMessage);
      }

      // Parse the response
      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch (error) {
        console.error('Failed to parse Bright Data response:', responseText);
        throw new Error('Invalid JSON response from Bright Data API');
      }

      // Bright Data might return an array or an object with errors
      if (!responseData) {
        console.warn(`No data returned for ${username}`);
        return { profile: null, relatedAccounts: [] };
      }

      // Check if response is an error object (but not if it has id/account which means it's valid data)
      if (
        (responseData.error || responseData.message) &&
        !responseData.id &&
        !responseData.account
      ) {
        console.error('Bright Data error response:', responseData);
        return { profile: null, relatedAccounts: [] };
      }

      // Bright Data can return either an array or a single object
      let profileData: BrightDataResponse;

      if (Array.isArray(responseData)) {
        if (responseData.length === 0) {
          console.warn(`No profile data returned for ${username}`);
          return { profile: null, relatedAccounts: [] };
        }
        profileData = responseData[0];
      } else if (responseData.id || responseData.account) {
        // Single object response - use it directly
        profileData = responseData as BrightDataResponse;
      } else {
        console.warn(
          `Unexpected response format for ${username}:`,
          typeof responseData,
          Object.keys(responseData || {}),
        );
        return { profile: null, relatedAccounts: [] };
      }

      if (!profileData) {
        console.warn(`Profile data is null/undefined for ${username}`);
        return { profile: null, relatedAccounts: [] };
      }

      // Skip private accounts
      if (profileData.is_private) {
        return { profile: null, relatedAccounts: [] };
      }

      // Check if account is German
      if (!isGermanAccount(profileData.biography, profileData.full_name)) {
        return { profile: null, relatedAccounts: [] }; // Skip non-German accounts
      }

      // Map Bright Data response to CoachProfile
      const detectedNiche = detectNicheFromBio(
        profileData.biography,
        profileData.full_name,
      );

      // Extract profile image URL (may be obfuscated in response)
      let profilePicUrl: string | undefined;
      if (profileData.profile_image_link) {
        const tempUrl = profileData.profile_image_link.replace(/\*/g, '');
        if (tempUrl.startsWith('http')) {
          profilePicUrl = tempUrl;
        }
      }

      // Extract username from account field (may be obfuscated)
      const extractedUsername = profileData.account
        ? profileData.account.replace(/\*/g, '')
        : username;

      // Upload profile picture to Supabase Storage for permanent URL
      let permanentProfilePicUrl: string | undefined;
      if (profilePicUrl) {
        try {
          const uploadedUrl = await uploadProfilePicture(
            profilePicUrl,
            extractedUsername,
          );
          if (uploadedUrl) {
            permanentProfilePicUrl = uploadedUrl;
            console.log(
              `Uploaded profile picture for ${extractedUsername} to Supabase Storage`,
            );
          } else {
            permanentProfilePicUrl = profilePicUrl;
            console.warn(
              `Failed to upload profile picture for ${extractedUsername}, using original URL`,
            );
          }
        } catch (error) {
          console.error(
            `Error uploading profile picture for ${extractedUsername}:`,
            error,
          );
          permanentProfilePicUrl = profilePicUrl;
        }
      }

      const mainProfile: CoachProfile = {
        id: profileData.id || username,
        username: extractedUsername || username,
        fullName: profileData.full_name,
        profilePicture: permanentProfilePicUrl || '',
        bio: profileData.biography,
        biography: profileData.biography,
        externalUrls: profileData.external_url?.[0],
        followersCount: profileData.followers || 0,
        followsCount: profileData.following || 0,
        postsCount: profileData.posts_count || 0,
        isBusinessAccount: profileData.is_business_account || false,
        isProfessionalAccount: profileData.is_professional_account || false,
        profilePicUrl: permanentProfilePicUrl,
        niche: detectedNiche,
        verified: profileData.is_verified || false,
      };

      // Extract and map related accounts
      const relatedAccounts: CoachProfile[] = [];
      if (
        profileData.related_accounts &&
        Array.isArray(profileData.related_accounts)
      ) {
        for (const relatedAccount of profileData.related_accounts) {
          const mappedAccount = this.mapRelatedAccountToProfile(relatedAccount);
          if (mappedAccount) {
            relatedAccounts.push(mappedAccount);
          }
        }
      }

      return { profile: mainProfile, relatedAccounts };
    } catch (error) {
      console.error(`Error fetching profile for ${username}:`, error);
      throw error;
    }
  }

  async fetchProfiles(usernames: string[]): Promise<CoachProfile[]> {
    const profiles: CoachProfile[] = [];
    const processedUsernames = new Set<string>();
    const usernamesToFetch: string[] = [];
    const { db } = await import('@/lib/db');

    // 1. Check DB for all usernames
    try {
      const cachedProfiles = await db.coachProfile.findMany({
        where: {
          username: { in: usernames },
        },
      });

      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      for (const username of usernames) {
        const cached = cachedProfiles.find((p) => p.username === username);
        // Only use cache if it's NOT partial AND fresh
        if (cached && !cached.isPartial && cached.lastFetched > sixMonthsAgo) {
          console.log(`Using cached profile for ${username} (batch)`);
          profiles.push(this.mapDbProfileToCoachProfile(cached));
          processedUsernames.add(username);
        } else {
          usernamesToFetch.push(username);
        }
      }
    } catch (error) {
      console.error('Error checking DB cache for batch:', error);
      // Fallback to fetching all if DB check fails
      usernamesToFetch.push(...usernames);
    }

    // 2. Fetch missing/stale profiles from API
    for (const username of usernamesToFetch) {
      if (processedUsernames.has(username)) continue;

      try {
        const { profile, relatedAccounts } =
          await this.fetchProfileWithRelated(username);

        // Add main profile
        if (profile) {
          profiles.push(profile);
          processedUsernames.add(profile.username.toLowerCase());

          // Save to DB (including related)
          // Note: relatedAccounts here is mapped type, need original structure if we want to save correctly
          // But saveProfileToDb takes mapped CoachProfile, so we need to adjust or call it differently.
          // For simplicity in this batch flow, we trust fetchProfileWithRelated to handle just scraping,
          // and we call saveProfileToDb separately if we want, OR we reuse fetchProfile logic.
          // Actually, let's reuse fetchProfile logic for saving,
          // but here we already have the data. Ideally saveProfileToDb should be utilized.
          // Since fetchProfileWithRelated doesn't return raw data, we can't pass RelatedAccount[] easily.
          // Let's modify fetchProfileWithRelated to save to DB internally or refactor.

          // Refactoring: Let's just save the main profile here for now without related relations
          // to keep type safety until we refactor further, OR assume fetchProfile handles singular updates.
          // Wait, fetchProfile is public method. fetchProfileWithRelated is private.

          // Let's just update the DB with the profile data we got.
          await this.saveProfileToDb(profile, []); // Pass empty related for now in batch to avoid complexity mismatch
        }

        // Add related accounts (avoid duplicates)
        for (const relatedAccount of relatedAccounts) {
          const usernameKey = relatedAccount.username.toLowerCase();
          if (!processedUsernames.has(usernameKey)) {
            profiles.push(relatedAccount);
            processedUsernames.add(usernameKey);
          }
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error fetching ${username}:`, error);
        // Continue with next username
      }
    }

    return profiles;
  }

  /**
   * Trigger asynchronous batch fetch for multiple URLs
   * Returns snapshot ID for tracking progress
   */
  async fetchProfilesByUrlBatch(urls: string[]): Promise<{
    snapshotId: string | null;
    cachedProfiles: CoachProfile[];
  }> {
    try {
      const { db } = await import('@/lib/db');

      const cachedProfiles: CoachProfile[] = [];
      const urlsToFetch: string[] = [];

      // 1. Check DB for each URL
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Map URLs to usernames for DB lookup
      // Basic extraction: removal of trailing slash and taking last segment
      const urlToUsernameMap = new Map<string, string>();
      const usernamesToCheck: string[] = [];

      for (const url of urls) {
        try {
          // Remove query params and trailing slash
          const cleanUrl = url.split('?')[0].replace(/\/$/, '');
          const segments = cleanUrl.split('/');
          const username = segments[segments.length - 1];
          if (username) {
            urlToUsernameMap.set(url, username.toLowerCase());
            usernamesToCheck.push(username.toLowerCase());
          } else {
            urlsToFetch.push(url);
          }
        } catch (e) {
          urlsToFetch.push(url);
        }
      }

      if (usernamesToCheck.length > 0) {
        try {
          const dbProfiles = await db.coachProfile.findMany({
            where: {
              username: { in: usernamesToCheck },
            },
          });

          for (const url of urls) {
            const username = urlToUsernameMap.get(url);
            if (username) {
              const profile = dbProfiles.find((p) => p.username === username);
              // Check freshness and partial status
              if (
                profile &&
                !profile.isPartial &&
                profile.lastFetched > sixMonthsAgo
              ) {
                console.log(
                  `Using cached profile for ${username} (batch preload)`,
                );
                cachedProfiles.push(this.mapDbProfileToCoachProfile(profile));
              } else {
                urlsToFetch.push(url);
              }
            }
          }
        } catch (dbError) {
          console.error(
            'Failed to check DB cache for batch (proceeding with API fetch):',
            dbError,
          );
          // Fallback: fetch everything from API if DB check fails
          urlsToFetch.length = 0; // Clear potentially partial list
          urlsToFetch.push(...urls);
        }
      } else {
        // Fallback if extraction failed
        urlsToFetch.push(...urls);
      }

      // If all profiles are cached, return immediately
      if (urlsToFetch.length === 0) {
        console.log('All profiles found in cache, skipping API trigger');
        return { snapshotId: null, cachedProfiles };
      }

      console.log(
        `Triggering batch fetch for ${urlsToFetch.length} profiles (${cachedProfiles.length} cached)`,
      );

      // Format URLs for Bright Data API
      const input = urlsToFetch.map((url) => ({ url }));

      // console.log('Triggering batch fetch for URLs Inputssss:', input);
      const data = JSON.stringify({
        input,
      });

      // const data = JSON.stringify({
      //   input: [
      //     { url: 'https://www.instagram.com/cats_of_world_/' },
      //     { url: 'https://www.instagram.com/dogsofinstagram/' },
      //     { url: 'https://www.instagram.com/zoobarcelona' },
      //     { url: 'https://www.instagram.com/australiazoo' },
      //   ],
      // });

      // console.log('Triggering batch fetch for URLs Inputssss:', data);

      // fetch(
      //   'https://api.brightdata.com/datasets/v3/trigger?dataset_id=gd_l1vikfch901nx3by4&notify=false&include_errors=true',
      //   {
      //     method: 'POST',
      //     headers: {
      //       Authorization: `Bearer ${this.apiKey}`,
      //       'Content-Type': 'application/json',
      //     },
      //     body: data,
      //   }
      // )
      //   .then((response) => response.json())
      //   .then((data) => console.log(data))
      //   .catch((error) => console.error('Error:', error));

      const response = await fetch(
        `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${this.datasetId}&notify=false&include_errors=true`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: data,
        },
      );

      // console.log('Response:', response);

      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = `API error: ${response.status} ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage =
            errorData.message ||
            errorData.error ||
            errorData.detail ||
            errorMessage;
          console.error('Bright Data batch trigger error:', errorData);
        } catch {
          console.error('Bright Data batch trigger error (raw):', responseText);
        }
        throw new Error(errorMessage);
      }

      // Parse response to get snapshot ID
      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch (error) {
        console.error('Failed to parse Bright Data response:', responseText);
        throw new Error('Invalid JSON response from Bright Data API');
      }

      // Extract snapshot ID from response
      const snapshotId = responseData.snapshot_id || responseData.id;
      if (!snapshotId) {
        console.error('No snapshot ID in response:', responseData);
        throw new Error('No snapshot ID returned from batch trigger');
      }

      console.log(`Batch job triggered with snapshot ID: ${snapshotId}`);
      return { snapshotId, cachedProfiles };
    } catch (error) {
      console.error('Error triggering batch fetch:', error);
      throw error;
    }
  }

  /**
   * Check the status of an asynchronous batch job
   */
  async getSnapshotStatus(snapshotId: string): Promise<{
    status: 'running' | 'ready' | 'failed';
    progress?: number;
    total?: number;
  }> {
    try {
      const response = await fetch(
        `https://api.brightdata.com/datasets/v3/progress/${snapshotId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to get snapshot status: ${response.status}`);
      }

      const data = await response.json();

      // Map Bright Data status to our status
      let status: 'running' | 'ready' | 'failed' = 'running';
      if (data.status === 'ready' || data.status === 'complete') {
        status = 'ready';
      } else if (data.status === 'failed' || data.status === 'error') {
        status = 'failed';
      }

      return {
        status,
        progress: data.num_of_records || 0,
        total: data.total_rows || 0,
      };
    } catch (error) {
      console.error('Error checking snapshot status:', error);
      throw error;
    }
  }

  /**
   * Retrieve completed batch data
   */
  async getSnapshotData(snapshotId: string): Promise<CoachProfile[]> {
    try {
      const response = await fetch(
        `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to get snapshot data: ${response.status}`);
      }

      const responseText = await response.text();
      let data: any[];

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error('Failed to parse snapshot data:', responseText);
        throw new Error('Invalid JSON response from snapshot data');
      }

      if (!Array.isArray(data)) {
        console.error('Snapshot data is not an array:', data);
        throw new Error('Invalid snapshot data format');
      }

      // Map each item to CoachProfile
      const profiles: CoachProfile[] = [];
      for (const item of data) {
        const profileData = item as BrightDataResponse;

        // Skip private accounts
        if (profileData.is_private) {
          continue;
        }

        // Check if account is German
        if (!isGermanAccount(profileData.biography, profileData.full_name)) {
          continue;
        }

        // Map to CoachProfile
        const detectedNiche = detectNicheFromBio(
          profileData.biography,
          profileData.full_name,
        );

        let profilePicUrl: string | undefined;
        if (profileData.profile_image_link) {
          profilePicUrl = profileData.profile_image_link.replace(/\*/g, '');
          if (!profilePicUrl.startsWith('http')) {
            profilePicUrl = undefined;
          }
        }

        const extractedUsername = profileData.account
          ? profileData.account.replace(/\*/g, '')
          : '';

        if (!extractedUsername) {
          continue; // Skip if no username
        }

        const profile: CoachProfile = {
          id: profileData.id || extractedUsername,
          username: extractedUsername,
          fullName: profileData.full_name,
          profilePicture: profilePicUrl || '',
          bio: profileData.biography,
          biography: profileData.biography,
          externalUrls: profileData.external_url?.[0],
          followersCount: profileData.followers || 0,
          followsCount: profileData.following || 0,
          postsCount: profileData.posts_count || 0,
          isBusinessAccount: profileData.is_business_account || false,
          isProfessionalAccount: profileData.is_professional_account || false,
          profilePicUrl: profilePicUrl,
          niche: detectedNiche,
          verified: profileData.is_verified || false,
        };

        profiles.push(profile);

        // Save to Database
        await this.saveProfileToDb(profile, profileData.related_accounts);
      }

      console.log(`Processed ${profiles.length} profiles from snapshot`);
      return profiles;
    } catch (error) {
      console.error('Error retrieving snapshot data:', error);
      throw error;
    }
  }
}
