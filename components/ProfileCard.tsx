import { CoachProfile } from '@/lib/types';
import { formatFollowerCount } from '@/lib/utils';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

interface ProfileCardProps {
  profile: CoachProfile;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const getAvatarColor = (id: string) => {
    const colors = [
      'bg-blue-500',
      'bg-indigo-500',
      'bg-emerald-600',
      'bg-amber-500',
      'bg-purple-500',
      'bg-rose-500',
    ];
    // Create a stable index based on the string ID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const avatarColor = getAvatarColor(profile.id);
  const originalProfilePicUrl =
    profile.profilePicUrlHD || profile.profilePicUrl || profile.profilePicture;

  // Use proxy route to bypass CORS issues for external URLs
  // but use Supabase URLs directly
  const profilePicUrl = originalProfilePicUrl
    ? originalProfilePicUrl.includes('supabase.co')
      ? originalProfilePicUrl
      : `/api/image-proxy?url=${encodeURIComponent(originalProfilePicUrl)}`
    : null;

  const instagramUrl = `https://www.instagram.com/${profile.username}/`;

  return (
    <Card className='group overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 border-transparent py-0'>
      <CardContent className='p-4'>
        <div className='flex md:flex-row flex-col md:space-x-5 space-y-5 md:space-y-0 items-start justify-start w-full'>
          {/* Avatar */}
          <div className='relative shrink-0'>
            <div className='relative h-full w-full md:w-40 rounded-xl overflow-hidden'>
              {profilePicUrl ? (
                <img
                  src={profilePicUrl}
                  alt={`${profile.username}'s profile picture`}
                  className='h-full w-full object-cover'
                  referrerPolicy='no-referrer'
                  loading='lazy'
                  onError={(e) => {
                    // Fallback to colored initial if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div
                className={`${avatarColor} text-xl font-bold transition-transform group-hover:scale-105 h-full w-full flex items-center justify-center text-white ${profilePicUrl ? 'hidden' : 'flex'
                  }`}
              >
                {profile.username.charAt(0).toUpperCase()}
              </div>
            </div>

            {profile.verified && (
              <div className='absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center ring-2 ring-background z-10'>
                <BadgeCheck className='h-4 w-4 text-white' />
              </div>
            )}
          </div>

          <div className='flex flex-col items-start gap-4 w-full'>
            {/* Main Info */}
            <div className='flex-1 min-w-0'>
              <div className='flex flex-col items-start justify-between gap-1'>
                <h3 className='font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors'>
                  @{profile.username}
                </h3>
                <Badge variant='secondary'>{profile.niche}</Badge>
              </div>

              <p className='text-sm text-muted-foreground mt-1'>
                {formatFollowerCount(profile.followersCount)} followers
              </p>
            </div>

            {/* Bio + Action */}
            <div className='space-y-3 w-full'>
              <p className='text-sm text-muted-foreground line-clamp-2'>
                {profile.bio || 'Coach & mentor helping people level up'}
              </p>

              <Button
                asChild
                variant='outline'
              >
                <Link
                  href={instagramUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-full justify-between hover:bg-primary/10'
                >
                  <span>View Profile</span>
                  <ArrowRight className='h-4 w-4' />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
