import { CoachProfile } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

interface RelatedAccountCardProps {
  profile: CoachProfile;
}

export default function RelatedAccountCard({ profile }: RelatedAccountCardProps) {
  const getAvatarColor = (id: string) => {
    const colors = [
      'bg-blue-500',
      'bg-indigo-500',
      'bg-emerald-600',
      'bg-amber-500',
      'bg-purple-500',
      'bg-rose-500',
    ];
    const index = parseInt(id) % colors.length;
    return colors[index];
  };

  const avatarColor = getAvatarColor(profile.id);
  const originalProfilePicUrl =
    profile.profilePicUrlHD || profile.profilePicUrl || profile.profilePicture;
  // Use proxy route to bypass CORS issues
  const profilePicUrl = originalProfilePicUrl
    ? `/api/image-proxy?url=${encodeURIComponent(originalProfilePicUrl)}`
    : null;
  const instagramUrl = `https://www.instagram.com/${profile.username}/`;

  return (
    <Card className='group overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 border-transparent py-0'>
      <CardContent className='p-3'>
        <div className='flex items-center gap-3'>
          {/* Avatar */}
          <div className='relative shrink-0'>
            <div className='relative h-10 w-10 rounded-full overflow-hidden'>
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
                className={`${avatarColor} text-sm font-bold transition-transform group-hover:scale-105 h-full w-full flex items-center justify-center text-white ${
                  profilePicUrl ? 'hidden' : 'flex'
                }`}
              >
                {profile.username.charAt(0).toUpperCase()}
              </div>
            </div>

            {profile.verified && (
              <div className='absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-blue-600 flex items-center justify-center ring-2 ring-background z-10'>
                <BadgeCheck className='h-2.5 w-2.5 text-white' />
              </div>
            )}
          </div>

          {/* Main Info */}
          <div className='flex-1 min-w-0'>
            <div className='flex flex-col items-start gap-1 mb-1'>
              <h3 className='font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors'>
                @{profile.username}
              </h3>
              {profile.fullName && (
                <span className='text-xs text-muted-foreground line-clamp-1'>
                  {profile.fullName}
                </span>
              )}
            </div>
            <Badge variant='secondary' className='text-xs mt-0.5'>
              {profile.niche}
            </Badge>
          </div>

          {/* Action Button */}
          <Button
            asChild
            variant='ghost'
            size='sm'
            className='shrink-0'
          >
            <Link
              href={instagramUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='p-1.5'
            >
              <ArrowRight className='h-4 w-4' />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

