import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const userCount = await prisma.user.count();
        const coachCount = await prisma.coachProfile.count();

        return NextResponse.json({
            status: 'healthy',
            database: 'connected',
            counts: {
                users: userCount,
                coaches: coachCount
            }
        });
    } catch (error) {
        console.error('Health check failed:', error);
        return NextResponse.json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Database connection failed'
        }, { status: 500 });
    }
}
