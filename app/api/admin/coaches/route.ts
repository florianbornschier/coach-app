import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for creating/updating coaches
const coachSchema = z.object({
  username: z.string().min(1),
  fullName: z.string().optional(),
  profilePicture: z.string().optional(),
  bio: z.string().optional(),
  biography: z.string().optional(),
  externalUrls: z.string().optional(),
  followersCount: z.number().default(0),
  followsCount: z.number().default(0),
  postsCount: z.number().default(0),
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

// GET /api/admin/coaches - List all coaches
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const niche = searchParams.get('niche') || '';

    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { username: { contains: search, mode: 'insensitive' as const } },
          { fullName: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(niche && { niche }),
    };

    const [coaches, total] = await Promise.all([
      prisma.coachProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.coachProfile.count({ where }),
    ]);

    return NextResponse.json({
      coaches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching coaches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coaches' },
      { status: 500 }
    );
  }
}

// POST /api/admin/coaches - Create a new coach
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validatedData = coachSchema.parse(body);

    // Generate ID from username
    const id = validatedData.username.toLowerCase();

    const coach = await prisma.coachProfile.create({
      data: {
        id,
        ...validatedData,
      },
    });

    return NextResponse.json(coach, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating coach:', error);
    return NextResponse.json(
      { error: 'Failed to create coach' },
      { status: 500 }
    );
  }
}
