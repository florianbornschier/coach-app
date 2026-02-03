import { InstagramProvider } from './base-provider';
import { CoachProfile } from '../types';
import {
  fetchInstagramProfile,
  mapToCoachProfile,
  isGermanAccount,
} from '../instagram-api';
import type { InstagramProfileResponse } from '../instagram-api';

/**
 * HasData API Provider Implementation
 */
export class HasDataProvider implements InstagramProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchProfile(username: string): Promise<CoachProfile | null> {
    try {
      const { uploadProfilePicture } = await import('../storage');

      const response = await fetch(
        `https://api.hasdata.com/scrape/instagram/profile?handle=${encodeURIComponent(
          username
        )}`,
        {
          method: 'GET',
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Profile not found: ${username}`);
          return null;
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(`HasData API error: ${response.status} ${response.statusText}`);
      }

      const data: InstagramProfileResponse = await response.json();

      // Check if account is German
      if (!isGermanAccount(data.biography, data.fullName)) {
        console.log(`Skipping @${username} - Not a German account`);
        return null; // Skip non-German accounts
      }

      const profile = mapToCoachProfile(data);
      if (!profile) return null;

      // Upload profile picture to Supabase for permanent storage
      const imageUrl = data.profilePicUrlHD || data.profilePicUrl;
      if (imageUrl) {
        try {
          const permanentUrl = await uploadProfilePicture(imageUrl, username);
          if (permanentUrl) {
            profile.profilePicture = permanentUrl;
            profile.profilePicUrl = permanentUrl;
          }
        } catch (error) {
          console.error(`Failed to upload profile picture for ${username}:`, error);
        }
      }

      return profile;
    } catch (error) {
      console.error(`Error fetching profile for ${username}:`, error);
      throw error;
    }
  }

  async fetchProfiles(usernames: string[]): Promise<CoachProfile[]> {
    const profiles: CoachProfile[] = [];

    for (const username of usernames) {
      try {
        const profile = await this.fetchProfile(username);
        if (profile) {
          profiles.push(profile);
        }
        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error fetching ${username}:`, error);
        // Continue with next username
      }
    }

    return profiles;
  }
}

