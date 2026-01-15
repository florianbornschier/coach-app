import { NextRequest, NextResponse } from 'next/server';
import { getInstagramProvider } from '@/lib/providers';
import { BrightDataProvider } from '@/lib/providers/brightdata-provider';

/**
 * POST /api/instagram/batch
 * Trigger asynchronous batch fetch for multiple Instagram URLs
 * Body: { urls: string[] }
 * Returns: { snapshotId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    // console.log('Received batch request with URLs:', urls);

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required and must not be empty' },
        { status: 400 }
      );
    }

    const provider = getInstagramProvider();

    // Check if provider supports batch operations
    if (!(provider instanceof BrightDataProvider)) {
      return NextResponse.json(
        {
          error:
            'Batch operations are only supported with Bright Data provider',
        },
        { status: 400 }
      );
    }

    // Trigger batch fetch
    const { snapshotId, cachedProfiles } =
      await provider.fetchProfilesByUrlBatch(urls);

    return NextResponse.json({ snapshotId, cachedProfiles });
  } catch (error) {
    console.error('Error in batch API route:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/instagram/batch?snapshotId=xxx
 * Check status or retrieve data for a batch job
 * Returns: { status: 'running' | 'ready' | 'failed', progress?, total?, profiles? }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const snapshotId = searchParams.get('snapshotId');

    if (!snapshotId) {
      return NextResponse.json(
        { error: 'snapshotId query parameter is required' },
        { status: 400 }
      );
    }

    const provider = getInstagramProvider();

    // Check if provider supports batch operations
    if (!(provider instanceof BrightDataProvider)) {
      return NextResponse.json(
        {
          error:
            'Batch operations are only supported with Bright Data provider',
        },
        { status: 400 }
      );
    }

    // Check snapshot status
    const statusInfo = await provider.getSnapshotStatus(snapshotId);

    // If ready, fetch the data
    if (statusInfo.status === 'ready') {
      const profiles = await provider.getSnapshotData(snapshotId);
      return NextResponse.json({
        ...statusInfo,
        profiles,
        count: profiles.length,
      });
    }

    // Otherwise, just return status
    return NextResponse.json(statusInfo);
  } catch (error) {
    console.error('Error in batch status API route:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
