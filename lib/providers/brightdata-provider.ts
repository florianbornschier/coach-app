import { InstagramProvider } from './base-provider';
import { CoachProfile } from '../types';
import { isGermanAccount, detectNicheFromBio } from '../instagram-api';

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

  async fetchProfile(username: string): Promise<CoachProfile | null> {
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
        }
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
          Object.keys(responseData || {})
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
        profileData.full_name
      );

      // Extract profile image URL (may be obfuscated in response)
      // Bright Data obfuscates URLs with asterisks, we need to reconstruct or use profile_url
      let profilePicUrl: string | undefined;
      if (profileData.profile_image_link) {
        // Try to reconstruct URL by replacing asterisks
        profilePicUrl = profileData.profile_image_link.replace(/\*/g, '');
        // If still invalid, try to get from profile_url
        if (!profilePicUrl.startsWith('http')) {
          profilePicUrl = undefined;
        }
      }

      // Extract username from account field (may be obfuscated)
      const extractedUsername = profileData.account
        ? profileData.account.replace(/\*/g, '')
        : username;

      const mainProfile: CoachProfile = {
        id: profileData.id || username,
        username: extractedUsername || username,
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

      return mainProfile;
    } catch (error) {
      console.error(`Error fetching profile for ${username}:`, error);
      throw error;
    }
  }

  /**
   * Map related account to CoachProfile
   */
  private mapRelatedAccountToProfile(
    relatedAccount: RelatedAccount
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
        }
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
          Object.keys(responseData || {})
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
        profileData.full_name
      );

      // Extract profile image URL (may be obfuscated in response)
      let profilePicUrl: string | undefined;
      if (profileData.profile_image_link) {
        profilePicUrl = profileData.profile_image_link.replace(/\*/g, '');
        if (!profilePicUrl.startsWith('http')) {
          profilePicUrl = undefined;
        }
      }

      // Extract username from account field (may be obfuscated)
      const extractedUsername = profileData.account
        ? profileData.account.replace(/\*/g, '')
        : username;

      const mainProfile: CoachProfile = {
        id: profileData.id || username,
        username: extractedUsername || username,
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
    const processedUsernames = new Set<string>(); // Track processed usernames to avoid duplicates

    for (const username of usernames) {
      try {
        const { profile, relatedAccounts } = await this.fetchProfileWithRelated(
          username
        );

        // Add main profile
        if (profile) {
          profiles.push(profile);
          processedUsernames.add(profile.username.toLowerCase());
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
}
