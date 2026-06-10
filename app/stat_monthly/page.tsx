import { redirect } from 'next/navigation';
import { getUser, getMonthlyRosterStats } from '@/lib/db/queries';
import { StatMonthlyClient } from './StatMonthlyClient';

export default async function StatMonthlyPage() {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  // Get current month in YYYY-MM format
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);

  // Fetch initial data for current month
  const initialData = await getMonthlyRosterStats(currentMonth);

  return <StatMonthlyClient initialData={initialData} initialMonth={currentMonth} />;
}   