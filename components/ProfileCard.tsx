import { CoachProfile } from '@/lib/types';
import { formatFollowerCount } from '@/lib/utils';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    const index = parseInt(id) % colors.length;
    return colors[index];
  };

  const avatarColor = getAvatarColor(profile.id);

  return (
    <Card className='group overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 border-transparent py-0'>
      <CardContent className='p-4'>
        <div className='flex items-center gap-4'>
          {/* Avatar */}
          <div className='relative shrink-0'>
            <Avatar className='h-14 w-14'>
              <AvatarFallback
                className={`${avatarColor} text-xl font-bold transition-transform group-hover:scale-105`}
              >
                {profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {profile.verified && (
              <div className='absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center ring-2 ring-background'>
                <BadgeCheck className='h-4 w-4 text-white' />
              </div>
            )}
          </div>

          {/* Main Info */}
          <div className='flex-1 min-w-0'>
            <div className='flex flex-col items-start justify-between gap-1'>
              <h3 className='font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors'>
                @{profile.username}
              </h3>
              <Badge variant='secondary'>{profile.niche}</Badge>
            </div>

            <p className='text-sm text-muted-foreground mt-1'>
              {formatFollowerCount(profile.followerCount)} followers
            </p>
          </div>
        </div>

        {/* Bio + Action */}
        <div className='mt-4 space-y-3'>
          <p className='text-sm text-muted-foreground line-clamp-2'>
            {profile.bio || 'Coach & mentor helping people level up'}
          </p>

          <Button
            asChild
            variant='outline'
          >
            <Link
              href={''}
              className='w-full justify-between hover:bg-primary/10'
            >
              <span>View Profile</span>
              <ArrowRight className='h-4 w-4' />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
