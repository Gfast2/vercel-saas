import Link from 'next/link';
import fs from 'fs/promises';
import path from 'path';

type Reading = {
  date: string;
  passage: string;
};

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

  const now = new Date();
  const todayLabel = `${now.getMonth() + 1}月${now.getDate()}日`;

  const todaysReading = readings.find((reading) => reading.date === todayLabel);

  return (
    <main className="min-h-[100dvh] bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Bible Daily
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Daily reading plan for the year.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            Back to home
          </Link>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Today&apos;s reading
            </h2>
            {todaysReading ? (
              <div className="mt-3">
                <p className="text-sm text-gray-500">{todaysReading.date}</p>
                <p className="mt-1 text-lg font-medium text-gray-800">
                  {todaysReading.passage}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-500">
                No reading configured for today.
              </p>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Full reading plan
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {readings.map((reading) => (
                <div
                  key={reading.date}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <p className="text-sm text-gray-500">{reading.date}</p>
                  <p className="mt-1 text-base font-medium text-gray-700">
                    {reading.passage}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
