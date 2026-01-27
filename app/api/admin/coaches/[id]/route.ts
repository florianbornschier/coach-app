import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const coachSchema = z.object({
  username: z.string().min(1).optional(),
  fullName: z.string().optional(),
  profilePicture: z.string().optional(),
  bio: z.string().optional(),
  biography: z.string().optional(),
  externalUrls: z.string().optional(),
  followersCount: z.number().optional(),
  followsCount: z.number().optional(),
  postsCount: z.number().optional(),
  isBusinessAccount: z.boolean().optional(),
  isProfessionalAccount: z.boolean().optional(),
  profilePicUrl: z.string().optional(),
  niche: z.string().optional(),
  verified: z.boolean().optional(),
  careerPageUrl: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  applicationUrl: z.string().optional(),
  metaAdsLibraryUrl: z.string().optional(),
  googleAdsLibraryUrl: z.string().optional(),
  isRunningAds: z.boolean().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/admin/coaches/[id] - Get a single coach
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const coach = await prisma.coachProfile.findUnique({
      where: { id: params.id },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    return NextResponse.json(coach);
  } catch (error) {
    console.error('Error fetching coach:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coach' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/coaches/[id] - Update a coach
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validatedData = coachSchema.parse(body);

    const coach = await prisma.coachProfile.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(coach);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating coach:', error);
    return NextResponse.json(
      { error: 'Failed to update coach' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/coaches/[id] - Delete a coach
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    await prisma.coachProfile.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coach:', error);
    return NextResponse.json(
      { error: 'Failed to delete coach' },
      { status: 500 }
    );
  }
}
