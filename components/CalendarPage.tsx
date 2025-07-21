import React, { useState } from 'react';
import { Patient, Treatment } from '../types';

interface CalendarPageProps {
  patients: Patient[];
}

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayIdx = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();
  const matrix: (Date | null)[][] = [];
  let current = 1 - firstDayIdx;
  for (let week = 0; week < 6; week++) {
    const row: (Date | null)[] = [];
    for (let d = 0; d < 7; d++) {
      if (current < 1 || current > daysInMonth) {
        row.push(null);
      } else {
        row.push(new Date(year, month, current));
      }
      current++;
    }
    matrix.push(row);
    if (current > daysInMonth) break;
  }
  return matrix;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ patients }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedTreatment, setSelectedTreatment] = useState<(Treatment & { patientName: string }) | null>(null);

  const allTreatments: (Treatment & { patientName: string })[] = patients
    .flatMap((p) => (p.treatments || []).map((t) => ({ ...t, patientName: p.name })))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const treatmentMap: Record<string, (Treatment & { patientName: string })[]> = {};
  allTreatments.forEach((t) => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!treatmentMap[key]) treatmentMap[key] = [];
    treatmentMap[key].push(t);
  });

  const monthMatrix = getMonthMatrix(viewYear, viewMonth);
  const viewMonthName = new Date(viewYear, viewMonth, 1).toLocaleString('id-ID', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setViewMonth((m) => (m === 0 ? 11 : m - 1));
    if (viewMonth === 0) setViewYear((y) => y - 1);
  };
  const handleNextMonth = () => {
    setViewMonth((m) => (m === 11 ? 0 : m + 1));
    if (viewMonth === 11) setViewYear((y) => y + 1);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kalender Treatment</h1>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="px-3 py-1 rounded bg-gray-100 text-blue-700 font-bold">&lt;</button>
          <span className="font-semibold text-lg">{viewMonthName}</span>
          <button onClick={handleNextMonth} className="px-3 py-1 rounded bg-gray-100 text-blue-700 font-bold">&gt;</button>
        </div>
      </div>
      <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
        <div className="grid" style={{ gridTemplateColumns: `repeat(7, 1fr)` }}>
          {days.map((d, i) => (
            <div key={i} className="bg-gray-50 text-blue-700 font-bold py-3 text-center border-b border-gray-200">{d}</div>
          ))}
          {monthMatrix.map((week, wIdx) =>
            week.map((date, dIdx) => {
              const key = date
                ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                : '';
              const treatments = date ? treatmentMap[key] || [] : [];
              const isToday = date && date.toDateString() === today.toDateString();
              return (
                <div
                  key={`cell-${wIdx}-${dIdx}`}
                  className={`min-h-[90px] border-b border-r last:border-r-0 px-2 py-2 relative ${isToday ? 'bg-blue-50' : 'bg-white'} ${date ? '' : 'bg-gray-50'}`}
                  style={{ borderColor: '#e5e7eb' }}
                >
                  <div className={`text-xs font-bold mb-1 ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>{date ? date.getDate() : ''}</div>
                  {treatments.map((t, idx) => (
                    <div
                      key={t.id + '-' + idx}
                      className="bg-blue-100 text-blue-900 rounded px-2 py-1 mb-1 text-xs font-semibold shadow cursor-pointer hover:bg-blue-200"
                      onClick={() => setSelectedTreatment(t)}
                    >
                      <div>{t.patientName}</div>
                      <div className="text-xs text-blue-600 font-normal">{t.procedure}</div>
                      <div className="text-xs text-gray-500">Gigi: {t.toothIds && t.toothIds.join(', ')}</div>
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* Modal detail treatment */}
      {selectedTreatment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 min-w-[320px] max-w-[90vw]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Detail Treatment</h2>
              <button onClick={() => setSelectedTreatment(null)} className="text-gray-400 hover:text-gray-700 text-xl">×</button>
            </div>
            <div className="space-y-2">
              <div><span className="font-semibold">Pasien:</span> {selectedTreatment.patientName}</div>
              <div><span className="font-semibold">Tanggal:</span> {selectedTreatment.date ? new Date(selectedTreatment.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</div>
              <div><span className="font-semibold">Gigi:</span> {selectedTreatment.toothIds && selectedTreatment.toothIds.join(', ')}</div>
              <div><span className="font-semibold">Prosedur:</span> {selectedTreatment.procedure}</div>
              <div><span className="font-semibold">Catatan:</span> {selectedTreatment.notes || '-'}</div>
              <div><span className="font-semibold">Biaya:</span> {typeof selectedTreatment.cost === 'number' ? `Rp ${selectedTreatment.cost.toLocaleString('id-ID')}` : '-'}</div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelectedTreatment(null)} className="px-5 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage; 