export interface CoachProfile {
  id: string;
  username: string;
  profilePicture: string;
  bio?: string;
  followerCount: number;
  niche: string;
  verified: boolean;
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

export type Niche = typeof NICHES[number];
