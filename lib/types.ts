export interface CoachProfile {
  id: string;
  username: string;
  fullName?: string;
  profilePicture: string;
  bio?: string;
  biography?: string;
  externalUrls?: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  isBusinessAccount: boolean;
  isProfessionalAccount: boolean;
  profilePicUrl?: string;
  profilePicUrlHD?: string;
  niche: string;
  verified: boolean;
  isPartial?: boolean;
}

export interface FilterOptions {
  niches: string[];
  minFollowers: number;
  maxFollowers: number;
  searchQuery: string;
}

export const NICHES = [
  'Fitness',
  'Business',
  'Lifestyle',
  'Health & Wellness',
  'Marketing',
  'Finance',
  'Personal Development',
  'Nutrition',
  'Mindfulness',
  'Entrepreneurship',
] as const;

export type Niche = (typeof NICHES)[number];
