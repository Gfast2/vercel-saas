'use server';

import { getRosterByDateAndService } from '@/lib/db/queries';

export async function getRosterDataForDate(day: string) {
  const rosterData = await Promise.all([
    getRosterByDateAndService(day, '讲员'),
    getRosterByDateAndService(day, '司会'),
    getRosterByDateAndService(day, '口译'),
    getRosterByDateAndService(day, '司琴'),
    getRosterByDateAndService(day, '投影'),
    getRosterByDateAndService(day, '音响'),
    getRosterByDateAndService(day, '主日录音'),
    getRosterByDateAndService(day, '周报'),
    getRosterByDateAndService(day, '图书馆1'),
    getRosterByDateAndService(day, '祷告会'),
    getRosterByDateAndService(day, '圣餐辅助1'),
    getRosterByDateAndService(day, '圣餐辅助2'),
    getRosterByDateAndService(day, '圣餐辅助3'),
    getRosterByDateAndService(day, '圣餐辅助4'),
  ]);

  const serviceNames = ['讲员', '司会', '口译', '司琴', '投影', '音响', '主日录音', '周报', '图书馆1', '祷告会', '圣餐辅助1', '圣餐辅助2', '圣餐辅助3', '圣餐辅助4'];
  const rosterMap: Record<string, string | null> = {};
  
  serviceNames.forEach((service, index) => {
    rosterMap[service] = rosterData[index]?.name || null;
  });

  return rosterMap;
}
