'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getRosterDataForDate } from './actions';

interface RosterClientProps {
  initialDates: string[];
  initialDay: string;
  initialRosterMap: Record<string, string | null>;
}

export function RosterClient({ initialDates, initialDay, initialRosterMap }: RosterClientProps) {
  const [day, setDay] = useState(initialDay);
  const [rosterMap, setRosterMap] = useState(initialRosterMap);
  const [isPending, startTransition] = useTransition();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date(initialDay + 'T00:00:00'));
  const datePickerRef = useRef<HTMLDivElement>(null);

  const currentIndex = initialDates.indexOf(day);
  const validDatesSet = new Set(initialDates);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDatePicker]);

  const handleSelectDate = (selectedDate: string) => {
    setDay(selectedDate);
    setShowDatePicker(false);
    startTransition(async () => {
      const newRosterMap = await getRosterDataForDate(selectedDate);
      setRosterMap(newRosterMap);
    });
  };

  const handlePreviousMonth = () => {
    setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 1));
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const year = pickerMonth.getFullYear();
    const month = pickerMonth.getMonth();
    const daysInMonth = getDaysInMonth(pickerMonth);
    const firstDay = getFirstDayOfMonth(pickerMonth);
    const days = [];
    const selectedDay = day;

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of month
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const isValid = validDatesSet.has(dateStr);
      const isSelected = dateStr === selectedDay;

      days.push(
        <button
          key={dateStr}
          onClick={() => isValid && handleSelectDate(dateStr)}
          disabled={!isValid}
          className={`p-2 text-sm font-medium rounded transition-colors ${
            isSelected
              ? 'bg-blue-600 text-white'
              : isValid
              ? 'hover:bg-blue-100 text-slate-700'
              : 'text-slate-300 cursor-not-allowed'
          }`}
        >
          {dayNum}
        </button>
      );
    }

    return days;
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newDay = initialDates[currentIndex - 1];
      setDay(newDay);
      startTransition(async () => {
        const newRosterMap = await getRosterDataForDate(newDay);
        setRosterMap(newRosterMap);
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < initialDates.length - 1) {
      const newDay = initialDates[currentIndex + 1];
      setDay(newDay);
      startTransition(async () => {
        const newRosterMap = await getRosterDataForDate(newDay);
        setRosterMap(newRosterMap);
      });
    }
  };

  const 圣餐 = [rosterMap['圣餐辅助1'], rosterMap['圣餐辅助2'], rosterMap['圣餐辅助3'], rosterMap['圣餐辅助4']].filter(name => name).join(', ');

  const SkeletonLoader = () => (
    <div className="h-5 bg-slate-200 rounded animate-pulse w-3/4"></div>
  );

  const renderCell = (value: string | null) => (
    isPending ? <SkeletonLoader /> : <span>{value || '-'}</span>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between flex-wrap mb-8 gap-1">
          <h1 className="text-4xl font-bold text-slate-800">Roster</h1>
          <div className="flex items-center gap-3 bg-white rounded-lg shadow-md p-2 relative">
            <button 
              className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors"
              onClick={handlePrevious}
              disabled={currentIndex === 0 || isPending}
            >
              <ChevronLeft size={24} className="text-slate-700" />
            </button>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="text-lg font-semibold min-w-[140px] text-center text-slate-800 hover:bg-slate-100 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calendar size={20} />
              {day}
            </button>
            <button 
              className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors"
              onClick={handleNext}
              disabled={currentIndex === initialDates.length - 1 || isPending}
            >
              <ChevronRight size={24} className="text-slate-700" />
            </button>

            {showDatePicker && (
              <div 
                ref={datePickerRef}
                className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl p-4 z-50 border border-slate-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={handlePreviousMonth}
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="font-semibold text-slate-800 min-w-[150px] text-center">
                    {pickerMonth.toLocaleString('en', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="p-2 text-center text-xs font-semibold text-slate-600">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar()}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
                <th className="w-24 sm:w-32 px-4 sm:px-6 py-4 text-left font-semibold text-white whitespace-nowrap">事工</th>
                <th className="px-4 sm:px-6 py-4 text-left font-semibold text-white">{day}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="hover:bg-blue-50 transition-colors">
                <td className="w-24 sm:w-32 px-4 sm:px-6 py-4 font-medium text-slate-700 whitespace-nowrap">讲员</td>
                <td className="px-4 sm:px-6 py-4 text-slate-600">{renderCell(rosterMap['讲员'])}</td>
              </tr>
              <tr className="bg-slate-50 hover:bg-blue-50 transition-colors">
                <td className="w-24 sm:w-32 px-4 sm:px-6 py-4 font-medium text-slate-700 whitespace-nowrap">司会</td>
                <td className="px-4 sm:px-6 py-4 text-slate-600">{renderCell(rosterMap['司会'])}</td>
              </tr>
              <tr className="hover:bg-blue-50 transition-colors">
                <td className="w-24 sm:w-32 px-4 sm:px-6 py-4 font-medium text-slate-700 whitespace-nowrap">口译</td>
                <td className="px-4 sm:px-6 py-4 text-slate-600">{renderCell(rosterMap['口译'])}</td>
              </tr>
              <tr className="bg-slate-50 hover:bg-blue-50 transition-colors">
                <td className="w-24 sm:w-32 px-4 sm:px-6 py-4 font-medium text-slate-700 whitespace-nowrap">司琴</td>
                <td className="px-4 sm:px-6 py-4 text-slate-600">{renderCell(rosterMap['司琴'])}</td>
              </tr>
              <tr className="hover:bg-blue-50 transition-colors">
                <td className="w-24 sm:w-32 px-4 sm:px-6 py-4 font-medium text-slate-700 whitespace-nowrap">投影</td>
                <td className="px-4 sm:px-6 py-4 text-slate-600">{renderCell(rosterMap['投影'])}</td>
              </tr>
              <tr className="bg-slate-50 hover:bg-blue-50 transition-colors">
                <td className="w-24 sm:w-32 px-4 sm:px-6 py-4 font-medium text-slate-700 whitespace-nowrap">音响</td>
                <td className="px-4 sm:px-6 py-4 text-slate-600">{renderCell(rosterMap['音响'])}</td>
              </tr>
              <tr className="hover:bg-blue-50 transition-colors">
                <td className="w-24 sm:w-32 px-4 sm:px-6 py-4 font-medium text-slate-700 whitespace-nowrap">录音</td>
                <td className="px-4 sm:px-6 py-4 text-slate-600">{renderCell(rosterMap['主日录音'])}</td>
              </tr>
              <tr className="bg-slate-50 hover:bg-blue-50 transition-colors">
                <td className="w-24 sm:w-32 px-4 sm:px-6 py-4 font-medium text-slate-700 whitespace-nowrap">周报</td>
                <td className="px-4 sm:px-6 py-4 text-slate-600">{renderCell(rosterMap['周报'])}</td>
              </tr>
              <tr className="hover:bg-blue-50 transition-colors">
                <td className="w-24 sm:w-32 px-4 sm:px-6 py-4 font-medium text-slate-700 whitespace-nowrap">图书馆</td>
                <td className="px-4 sm:px-6 py-4 text-slate-600">{renderCell(rosterMap['图书馆1'])}</td>
              </tr>
              <tr className="bg-slate-50 hover:bg-blue-50 transition-colors">
                <td className="w-24 sm:w-32 px-4 sm:px-6 py-4 font-medium text-slate-700 whitespace-nowrap">祷告会</td>
                <td className="px-4 sm:px-6 py-4 text-slate-600">{renderCell(rosterMap['祷告会'])}</td>
              </tr>
              <tr className="hover:bg-blue-50 transition-colors">
                <td className="w-24 sm:w-32 px-4 sm:px-6 py-4 font-medium text-slate-700 whitespace-nowrap">圣餐</td>
                <td className="px-4 sm:px-6 py-4 text-slate-600">{renderCell(圣餐)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );}