'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { NICHES } from '@/lib/types';

const coachSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  fullName: z.string().optional(),
  profilePicture: z.string().optional(),
  bio: z.string().optional(),
  biography: z.string().optional(),
  externalUrls: z.string().optional(),
  followersCount: z.number().min(0).default(0),
  followsCount: z.number().min(0).default(0),
  postsCount: z.number().min(0).default(0),
  isBusinessAccount: z.boolean().default(false),
  isProfessionalAccount: z.boolean().default(false),
  profilePicUrl: z.string().optional(),
  niche: z.string().optional(),
  verified: z.boolean().default(false),
  careerPageUrl: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  applicationUrl: z.string().optional(),
  metaAdsLibraryUrl: z.string().optional(),
  googleAdsLibraryUrl: z.string().optional(),
  isRunningAds: z.boolean().default(false),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type CoachFormData = z.infer<typeof coachSchema>;

interface CoachFormProps {
  coach?: any; // For editing
  onSuccess?: () => void;
}

export default function CoachForm({ coach, onSuccess }: CoachFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(coach?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CoachFormData>({
    resolver: zodResolver(coachSchema),
    defaultValues: coach || {
      followersCount: 0,
      followsCount: 0,
      postsCount: 0,
      isBusinessAccount: false,
      isProfessionalAccount: false,
      verified: false,
      isRunningAds: false,
      tags: [],
    },
  });

  const onSubmit = async (data: CoachFormData) => {
    try {
      setLoading(true);

      const payload = {
        ...data,
        tags,
      };

      const url = coach ? `/api/admin/coaches/${coach.id}` : '/api/admin/coaches';
      const method = coach ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save coach');
      }

      toast.success(coach ? 'Coach updated successfully' : 'Coach created successfully');

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/coaches');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
      <div className='grid gap-8 md:grid-cols-2'>
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='username'>Username *</Label>
              <Input
                id='username'
                {...register('username')}
                placeholder='instagram_username'
              />
              {errors.username && (
                <p className='text-sm text-red-500'>{errors.username.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor='fullName'>Full Name</Label>
              <Input
                id='fullName'
                {...register('fullName')}
                placeholder='John Doe'
              />
            </div>

            <div>
              <Label htmlFor='niche'>Niche</Label>
              <Select onValueChange={(value) => setValue('niche', value)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select a niche' />
                </SelectTrigger>
                <SelectContent>
                  {NICHES.map((niche) => (
                    <SelectItem key={niche} value={niche}>
                      {niche}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='profilePicUrl'>Profile Picture URL</Label>
              <Input
                id='profilePicUrl'
                {...register('profilePicUrl')}
                placeholder='https://...'
              />
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='verified'
                {...register('verified')}
                onCheckedChange={(checked) => setValue('verified', !!checked)}
              />
              <Label htmlFor='verified'>Verified Account</Label>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Statistics</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='followersCount'>Followers Count</Label>
              <Input
                id='followersCount'
                type='number'
                {...register('followersCount', { valueAsNumber: true })}
                placeholder='0'
              />
            </div>

            <div>
              <Label htmlFor='followsCount'>Following Count</Label>
              <Input
                id='followsCount'
                type='number'
                {...register('followsCount', { valueAsNumber: true })}
                placeholder='0'
              />
            </div>

            <div>
              <Label htmlFor='postsCount'>Posts Count</Label>
              <Input
                id='postsCount'
                type='number'
                {...register('postsCount', { valueAsNumber: true })}
                placeholder='0'
              />
            </div>

            <div className='space-y-2'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='isBusinessAccount'
                  {...register('isBusinessAccount')}
                  onCheckedChange={(checked) => setValue('isBusinessAccount', !!checked)}
                />
                <Label htmlFor='isBusinessAccount'>Business Account</Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='isProfessionalAccount'
                  {...register('isProfessionalAccount')}
                  onCheckedChange={(checked) => setValue('isProfessionalAccount', !!checked)}
                />
                <Label htmlFor='isProfessionalAccount'>Professional Account</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio and Description */}
        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle>Bio and Description</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='bio'>Short Bio</Label>
              <Textarea
                id='bio'
                {...register('bio')}
                placeholder='Brief description...'
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor='biography'>Detailed Biography</Label>
              <Textarea
                id='biography'
                {...register('biography')}
                placeholder='Detailed biography...'
                rows={5}
              />
            </div>

            <div>
              <Label htmlFor='externalUrls'>External URLs</Label>
              <Textarea
                id='externalUrls'
                {...register('externalUrls')}
                placeholder='Website, social media links...'
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Career Information */}
        <Card>
          <CardHeader>
            <CardTitle>Career Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='careerPageUrl'>Career Page URL</Label>
              <Input
                id='careerPageUrl'
                {...register('careerPageUrl')}
                placeholder='https://...'
              />
            </div>

            <div>
              <Label htmlFor='contactEmail'>Contact Email</Label>
              <Input
                id='contactEmail'
                type='email'
                {...register('contactEmail')}
                placeholder='contact@example.com'
              />
            </div>

            <div>
              <Label htmlFor='contactPhone'>Contact Phone</Label>
              <Input
                id='contactPhone'
                {...register('contactPhone')}
                placeholder='+1234567890'
              />
            </div>

            <div>
              <Label htmlFor='applicationUrl'>Application URL</Label>
              <Input
                id='applicationUrl'
                {...register('applicationUrl')}
                placeholder='https://...'
              />
            </div>
          </CardContent>
        </Card>

        {/* Ads Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>Ads Tracking</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='metaAdsLibraryUrl'>Meta Ads Library URL</Label>
              <Input
                id='metaAdsLibraryUrl'
                {...register('metaAdsLibraryUrl')}
                placeholder='https://www.facebook.com/ads/library/?...'
              />
            </div>

            <div>
              <Label htmlFor='googleAdsLibraryUrl'>Google Ads Library URL</Label>
              <Input
                id='googleAdsLibraryUrl'
                {...register('googleAdsLibraryUrl')}
                placeholder='https://adstransparency.google.com/advertiser/...'
              />
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='isRunningAds'
                {...register('isRunningAds')}
                onCheckedChange={(checked) => setValue('isRunningAds', !!checked)}
              />
              <Label htmlFor='isRunningAds'>Currently Running Ads</Label>
            </div>
          </CardContent>
        </Card>

        {/* Tags and Notes */}
        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle>Tags and Notes</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='notes'>Internal Notes</Label>
              <Textarea
                id='notes'
                {...register('notes')}
                placeholder='Internal notes for this coach...'
                rows={3}
              />
            </div>

            <div>
              <Label>Tags</Label>
              <div className='flex gap-2 mb-2'>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder='Add a tag...'
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type='button' onClick={addTag} variant='outline'>
                  Add
                </Button>
              </div>
              <div className='flex flex-wrap gap-2'>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'
                  >
                    {tag}
                    <button
                      type='button'
                      onClick={() => removeTag(tag)}
                      className='text-blue-600 hover:text-blue-800'
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='flex justify-end gap-4'>
        <Button
          type='button'
          variant='outline'
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type='submit' disabled={loading}>
          {loading ? 'Saving...' : coach ? 'Update Coach' : 'Create Coach'}
        </Button>
      </div>
    </form>
  );
}
