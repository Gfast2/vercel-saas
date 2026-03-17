import fs from 'fs/promises';
import path from 'path';

import BibleDailyClient, { Reading } from './BibleDailyClient';

async function getReadings(): Promise<Reading[]> {
  const filePath = path.join(process.cwd(), 'lib', 'db', 'bibleDaily.csv');
  const raw = await fs.readFile(filePath, 'utf8');
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [date, passage] = line.split(',', 2);
      return {
        date: date?.trim() ?? '',
        passage: passage?.trim() ?? ''
      };
    });
}

export default async function BibleDailyPage() {
  const readings = await getReadings();

  return <BibleDailyClient readings={readings} />;
}
