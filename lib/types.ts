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
  
  // Career/Contact Information
  careerPageUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  applicationUrl?: string;
  
  // Ads Tracking
  metaAdsLibraryUrl?: string;
  googleAdsLibraryUrl?: string;
  isRunningAds?: boolean;
  lastAdsCheck?: Date;
  
  // Additional metadata
  notes?: string;
  tags?: string[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  coachProfileId: string;
  createdAt: Date;
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
