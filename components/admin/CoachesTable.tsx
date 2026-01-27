'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CoachProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface CoachesTableProps {
  search?: string;
  niche?: string;
  page?: number;
  limit?: number;
}

export default function CoachesTable({
  search = '',
  niche = '',
  page = 1,
  limit = 50,
}: CoachesTableProps) {
  const [coaches, setCoaches] = useState<CoachProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoaches();
  }, [search, niche, page, limit]);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(niche && { niche }),
      });

      const response = await fetch(`/api/admin/coaches?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch coaches');
      }

      const data = await response.json();
      setCoaches(data.coaches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load coaches');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`Are you sure you want to delete ${username}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/coaches/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete coach');
      }

      setCoaches(coaches.filter(coach => coach.id !== id));
      toast.success('Coach deleted successfully');
    } catch (err) {
      toast.error('Failed to delete coach');
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-gray-500'>Loading coaches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-red-500'>Error: {error}</div>
      </div>
    );
  }

  if (coaches.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12'>
        <div className='text-gray-500 mb-4'>No coaches found</div>
        <Link href='/admin/coaches/new'>
          <Button>Add Your First Coach</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Niche</TableHead>
            <TableHead>Followers</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead>Ads</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coaches.map((coach) => (
            <TableRow key={coach.id}>
              <TableCell className='font-medium'>
                <Link
                  href={`/admin/coaches/${coach.id}`}
                  className='text-blue-600 hover:underline'
                >
                  @{coach.username}
                </Link>
              </TableCell>
              <TableCell>{coach.fullName || 'N/A'}</TableCell>
              <TableCell>
                {coach.niche && (
                  <Badge variant='secondary'>{coach.niche}</Badge>
                )}
              </TableCell>
              <TableCell>{coach.followersCount.toLocaleString()}</TableCell>
              <TableCell>
                {coach.verified ? (
                  <Badge variant='default'>Verified</Badge>
                ) : (
                  <Badge variant='outline'>Unverified</Badge>
                )}
              </TableCell>
              <TableCell>
                {coach.isRunningAds ? (
                  <Badge variant='destructive'>Running Ads</Badge>
                ) : (
                  <Badge variant='outline'>No Ads</Badge>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='h-8 w-8 p-0'>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/coaches/${coach.id}`}>
                        <Eye className='mr-2 h-4 w-4' />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/coaches/${coach.id}/edit`}>
                        <Edit className='mr-2 h-4 w-4' />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(coach.id, coach.username)}
                      className='text-red-600'
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
