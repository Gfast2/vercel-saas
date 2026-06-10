'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StatData {
  name: string;
  service_count: number;
}

interface StatMonthlyClientProps {
  initialData: StatData[];
  initialMonth: string;
}

export function StatMonthlyClient({ initialData, initialMonth }: StatMonthlyClientProps) {
  const [month, setMonth] = useState(initialMonth);
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const handlePreviousMonth = async () => {
    const date = new Date(month + '-01');
    date.setMonth(date.getMonth() - 1);
    const newMonth = date.toISOString().slice(0, 7);
    await fetchData(newMonth);
  };

  const handleNextMonth = async () => {
    const date = new Date(month + '-01');
    date.setMonth(date.getMonth() + 1);
    const newMonth = date.toISOString().slice(0, 7);
    await fetchData(newMonth);
  };

  const fetchData = async (selectedMonth: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/stat_monthly?month=${selectedMonth}`);
      if (response.ok) {
        const result = await response.json();
        setMonth(selectedMonth);
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch monthly statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Monthly Statistics</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handlePreviousMonth}
              disabled={isLoading}
              className="p-2 hover:bg-slate-100 rounded transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-semibold min-w-[100px] text-center">{month}</span>
            <button
              onClick={handleNextMonth}
              disabled={isLoading}
              className="p-2 hover:bg-slate-100 rounded transition-colors disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-slate-600">Service count by person for {month}</p>
      </div>

      {data.length === 0 ? (
        <div className="bg-slate-50 rounded-lg p-8 text-center">
          <p className="text-slate-600">No data available for this month</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fill: '#475569', fontSize: 12 }}
              />
              <YAxis
                label={{ value: 'Service Count', angle: -90, position: 'insideLeft' }}
                tick={{ fill: '#475569' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value) => [value, 'Services']}
                labelStyle={{ color: '#1e293b' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={() => 'Service Count'}
              />
              <Bar
                dataKey="service_count"
                fill="#2563eb"
                radius={[8, 8, 0, 0]}
                animationDuration={500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
