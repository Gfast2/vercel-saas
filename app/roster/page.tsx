import { redirect } from 'next/navigation';
import { getUser, getAllRosterDates, getRosterByDateAndService } from '@/lib/db/queries';
import { RosterClient } from './RosterClient';

export default async function RosterPage() {
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }

  const allDates = await getAllRosterDates();
  
  if (allDates.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Roster</h1>
        <p>No roster data available</p>
      </div>
    );
  }

  const initialDay = allDates[0];

  // Get roster data for the initial date
  const rosterData = await Promise.all([
    getRosterByDateAndService(initialDay, '讲员'),
    getRosterByDateAndService(initialDay, '司会'),
    getRosterByDateAndService(initialDay, '口译'),
    getRosterByDateAndService(initialDay, '司琴'),
    getRosterByDateAndService(initialDay, '投影'),
    getRosterByDateAndService(initialDay, '音响'),
    getRosterByDateAndService(initialDay, '主日录音'),
    getRosterByDateAndService(initialDay, '周报'),
    getRosterByDateAndService(initialDay, '图书馆1'),
    getRosterByDateAndService(initialDay, '祷告会'),
    getRosterByDateAndService(initialDay, '圣餐辅助1'),
    getRosterByDateAndService(initialDay, '圣餐辅助2'),
    getRosterByDateAndService(initialDay, '圣餐辅助3'),
    getRosterByDateAndService(initialDay, '圣餐辅助4'),
  ]);

  const serviceNames = ['讲员', '司会', '口译', '司琴', '投影', '音响', '主日录音', '周报', '图书馆1', '祷告会', '圣餐辅助1', '圣餐辅助2', '圣餐辅助3', '圣餐辅助4'];
  const initialRosterMap: Record<string, string | null> = {};
  
  serviceNames.forEach((service, index) => {
    initialRosterMap[service] = rosterData[index]?.name || null;
  });

  return <RosterClient initialDates={allDates} initialDay={initialDay} initialRosterMap={initialRosterMap} />;
}
