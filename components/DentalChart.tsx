import React from 'react';
import { Tooth } from '../types';
import ToothComponent from './ToothComponent';

interface DentalChartProps {
  teeth: Tooth[];
  selectedToothIds: number[];
  onToothClick: (toothId: number) => void;
}

const DentalChart: React.FC<DentalChartProps> = ({
  teeth,
  selectedToothIds,
  onToothClick,
}) => {
  // Baris atas: gigi 1-16 (kanan ke kiri)
  const upperTeeth = teeth.filter((t) => t.id >= 1 && t.id <= 16).sort((a, b) => a.id - b.id);
  // Baris bawah: gigi 17-32 (kiri ke kanan)
  const lowerTeeth = teeth.filter((t) => t.id >= 17 && t.id <= 32).sort((a, b) => a.id - b.id);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">
        Dental Chart
      </h3>
      <div className="flex flex-col items-center space-y-2 select-none">
        {/* Upper Jaw */}
        <div className="flex flex-row justify-center w-full">
          {upperTeeth.map((tooth) => (
            <ToothComponent
              key={tooth.id}
              tooth={tooth}
              onClick={onToothClick}
              isSelected={selectedToothIds.includes(tooth.id)}
            />
          ))}
        </div>
        {/* Lower Jaw */}
        <div className="flex flex-row justify-center w-full">
          {lowerTeeth.map((tooth) => (
            <ToothComponent
              key={tooth.id}
              tooth={tooth}
              onClick={onToothClick}
              isSelected={selectedToothIds.includes(tooth.id)}
            />
          ))}
        </div>
      </div>
      <div className="mt-4 text-xs text-gray-500 text-center">
         Klik gigi untuk memilih.
      </div>
    </div>
  );
};

export default DentalChart;
