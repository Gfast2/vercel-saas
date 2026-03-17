'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

export type Reading = {
  date: string;
  passage: string;
};

function toIsoDate(label: string, year: number) {
  const match = label.match(/^(\d{1,2})月(\d{1,2})日$/);
  if (!match) return '';
  const month = Number(match[1]);
  const day = Number(match[2]);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function toLabelFromIso(dateIso: string) {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatDateWithWeek(dateIso: string) {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const weekday = new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(date);
  return `${yyyy}-${mm}-${dd} ${weekday}`;
}

export default function BibleDailyClient({
  readings
}: {
  readings: Reading[];
}) {
  const today = new Date();
  const currentYear = today.getFullYear();

  const sortedIsoDates = useMemo(() => {
    return readings
      .map((r) => toIsoDate(r.date, currentYear))
      .filter(Boolean)
      .sort();
  }, [readings, currentYear]);

  const minDate = sortedIsoDates[0] ?? '';
  const maxDate = sortedIsoDates[sortedIsoDates.length - 1] ?? '';

  const [selectedDate, setSelectedDate] = useState(() => {
    const todayIso = today.toISOString().slice(0, 10);
    if (minDate && maxDate && todayIso >= minDate && todayIso <= maxDate) {
      return todayIso;
    }
    return minDate || todayIso;
  });

  const selectedLabel = toLabelFromIso(selectedDate);

  const selectedReading = useMemo(() => {
    return readings.find((reading) => reading.date === selectedLabel);
  }, [readings, selectedLabel]);

  const selectedDateWithWeek = formatDateWithWeek(selectedDate);

  const formattedReadingContent = selectedReading
    ? `读经日程\n${selectedDateWithWeek}\n${selectedReading.passage}`
    : '';

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  读经日程
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedDateWithWeek}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="reading-date">
                  Date
                </label>
                <input
                  id="reading-date"
                  type="date"
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  value={selectedDate}
                  min={minDate}
                  max={maxDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                />
              </div>
            </div>

            {selectedReading ? (
              <>
                <p className="text-sm text-gray-500">{selectedReading.date}</p>
                <p className="mt-1 text-lg font-medium text-gray-800">
                  {selectedReading.passage}
                </p>
                <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">
                    {formattedReadingContent}
                  </pre>
                </div>
              </>
              
            ) : (
              <p className="mt-6 text-sm text-gray-500">
                No reading configured for this date.
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
