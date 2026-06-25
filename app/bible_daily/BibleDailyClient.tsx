'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  const adjustDate = (days: number) => {
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    if (Number.isNaN(date.getTime())) return;

    date.setDate(date.getDate() + days);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const newDateIso = `${yyyy}-${mm}-${dd}`;

    if (minDate && newDateIso < minDate) return;
    if (maxDate && newDateIso > maxDate) return;

    setSelectedDate(newDateIso);
  };

  const formattedReadingContent = selectedReading
    ? `读经日程\n${selectedDateWithWeek}\n${selectedReading.passage}`
    : '';

  const copyToClipboard = async () => {
    if (!formattedReadingContent) return;

    await navigator.clipboard.writeText(formattedReadingContent);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

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
              </div>
              <div className="flex items-center justify-center-safe">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjustDate(-1)}
                    disabled={minDate ? selectedDate <= minDate : false}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous day"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <input
                    id="reading-date"
                    type="date"
                    className="h-9 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    value={selectedDate}
                    min={minDate}
                    max={maxDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => adjustDate(1)}
                    disabled={maxDate ? selectedDate >= maxDate : false}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next day"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mt-7">{selectedReading?.date}</p>
              <p className="mt-1 text-lg font-medium text-gray-800">
                {selectedReading?.passage}
              </p>
            </div>
            
            {selectedReading ? (
              <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="group w-full text-left"
                >
                  <div className="flex items-start justify-between">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">
                      {formattedReadingContent}
                    </pre>
                    <span className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none group-focus:ring-2 group-focus:ring-orange-500">
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </span>
                  </div>
                </button>
              </div>
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
