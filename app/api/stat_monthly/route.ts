import { getMonthlyRosterStats, getUser } from '@/lib/db/queries';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: 'Invalid month format. Use YYYY-MM' },
        { status: 400 }
      );
    }

    const data = await getMonthlyRosterStats(month);

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error fetching monthly statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monthly statistics' },
      { status: 500 }
    );
  }
}
