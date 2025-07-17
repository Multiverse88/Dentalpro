import React, { useState, useEffect } from 'react';
import { Treatment, Tooth, Patient, ToothStatus, OptionType } from '../types';
import { TOOTH_STATUS_OPTIONS } from '../constants';

interface TreatmentFormProps {
  patient: Patient;
  onSubmit: (treatment: Treatment, updatedTeeth: Tooth[]) => void;
  onClose: () => void;
  initialTreatment?: Treatment | null;
  defaultSelectedToothIds?: number[];
  isSubmitting?: boolean;
}

const TreatmentForm: React.FC<TreatmentFormProps> = ({
  patient,
  onSubmit,
  onClose,
  initialTreatment,
  defaultSelectedToothIds = [],
  isSubmitting = false,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedToothIds, setSelectedToothIds] = useState<number[]>([]);
  const [procedure, setProcedure] = useState('');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState<number | ''>('');
  const [newStatusForSelectedTeeth, setNewStatusForSelectedTeeth] = useState<
    ToothStatus | ''
  >('');

  useEffect(() => {
    if (initialTreatment) {
      setDate(initialTreatment.date.split('T')[0]);
      setSelectedToothIds(initialTreatment.toothIds);
      setProcedure(initialTreatment.procedure);
      setNotes(initialTreatment.notes || '');
      setCost(initialTreatment.cost || '');
      setNewStatusForSelectedTeeth('');
    } else {
      setSelectedToothIds(defaultSelectedToothIds);
      setDate(new Date().toISOString().split('T')[0]);
      setProcedure('');
      setNotes('');
      setCost('');
      setNewStatusForSelectedTeeth('');
    }
  }, [initialTreatment, defaultSelectedToothIds]);

  const handleToothSelection = (toothId: number) => {
    setSelectedToothIds((prev) =>
      prev.includes(toothId)
        ? prev.filter((id) => id !== toothId)
        : [...prev, toothId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedToothIds.length === 0 || !procedure) {
      alert('Mohon pilih minimal satu gigi dan isi deskripsi prosedur.');
      return;
    }

    const treatmentData: Treatment = {
      id: initialTreatment ? initialTreatment.id : crypto.randomUUID(),
      date: new Date(date).toISOString(),
      toothIds: selectedToothIds,
      procedure,
      notes,
      cost: cost === '' ? undefined : Number(cost),
    };

    let updatedPatientTeeth = [...patient.teeth];
    if (newStatusForSelectedTeeth) {
      updatedPatientTeeth = patient.teeth.map((tooth) =>
        selectedToothIds.includes(tooth.id)
          ? { ...tooth, status: newStatusForSelectedTeeth }
          : tooth
      );
    }

    onSubmit(treatmentData, updatedPatientTeeth);
  };

  const inputBaseClass =
    'mt-1 block w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed';

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-5xl p-8 mx-auto">
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700 mb-0.5"
        >
          Tanggal Perawatan
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputBaseClass}
          required
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-0.5">
          Gigi yang Dirawat
        </label>
        <div className="mt-2 flex flex-col gap-2">
          {/* Baris Atas: Gigi 1-16 */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200 min-w-full">
            <span className="text-xs text-gray-400 mr-2 whitespace-nowrap">Atas</span>
            {patient.teeth.filter(t => t.id >= 1 && t.id <= 16).sort((a, b) => a.id - b.id).map((tooth) => (
              <button
                type="button"
                key={tooth.id}
                onClick={() => handleToothSelection(tooth.id)}
                disabled={isSubmitting || tooth.status === ToothStatus.Missing || tooth.status === ToothStatus.Extracted}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg border text-xs font-semibold transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 min-w-[64px] min-h-[60px] shadow-sm
                  ${selectedToothIds.includes(tooth.id)
                    ? 'bg-indigo-100 border-indigo-500 text-indigo-700 ring-indigo-400'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-indigo-50 hover:border-indigo-400'}
                  ${isSubmitting ? 'opacity-60' : ''}`}
                title={`No. ${tooth.id}: ${tooth.name}`}
              >
                <span className="text-lg font-extrabold leading-none mb-1">{tooth.id}</span>
                <span className="text-xs font-medium text-gray-600 leading-tight text-center break-words max-w-[60px]">{tooth.name.replace('Gigi ', '')}</span>
              </button>
            ))}
          </div>
          {/* Baris Bawah: Gigi 17-32 */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 min-w-full">
            <span className="text-xs text-gray-400 mr-2 whitespace-nowrap">Bawah</span>
            {patient.teeth.filter(t => t.id >= 17 && t.id <= 32).sort((a, b) => a.id - b.id).map((tooth) => (
              <button
                type="button"
                key={tooth.id}
                onClick={() => handleToothSelection(tooth.id)}
                disabled={isSubmitting || tooth.status === ToothStatus.Missing || tooth.status === ToothStatus.Extracted}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg border text-xs font-semibold transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 min-w-[64px] min-h-[60px] shadow-sm
                  ${selectedToothIds.includes(tooth.id)
                    ? 'bg-indigo-100 border-indigo-500 text-indigo-700 ring-indigo-400'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-indigo-50 hover:border-indigo-400'}
                  ${isSubmitting ? 'opacity-60' : ''}`}
                title={`No. ${tooth.id}: ${tooth.name}`}
              >
                <span className="text-lg font-extrabold leading-none mb-1">{tooth.id}</span>
                <span className="text-xs font-medium text-gray-600 leading-tight text-center break-words max-w-[60px]">{tooth.name.replace('Gigi ', '')}</span>
              </button>
            ))}
          </div>
        </div>
        {selectedToothIds.length > 0 && (
          <p className="text-xs text-gray-600 mt-1.5">
            Terpilih: {selectedToothIds.sort((a, b) => a - b).join(', ')}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="procedure"
          className="block text-sm font-medium text-gray-700 mb-0.5"
        >
          Prosedur/Tindakan
        </label>
        <input
          type="text"
          id="procedure"
          value={procedure}
          onChange={(e) => setProcedure(e.target.value)}
          placeholder="e.g., Penambalan Komposit, Ekstraksi"
          className={inputBaseClass}
          required
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label
          htmlFor="newStatus"
          className="block text-sm font-medium text-gray-700 mb-0.5"
        >
          Ubah Status Gigi Terpilih Menjadi (Opsional)
        </label>
        <select
          id="newStatus"
          value={newStatusForSelectedTeeth}
          onChange={(e) =>
            setNewStatusForSelectedTeeth(e.target.value as ToothStatus | '')
          }
          className={`${inputBaseClass} bg-white`}
          disabled={isSubmitting}
        >
          <option value="">-- Tidak mengubah status --</option>
          {TOOTH_STATUS_OPTIONS.map((opt: OptionType) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Jika diisi, status semua gigi terpilih akan diubah.
        </p>
      </div>
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-0.5"
        >
          Catatan Tambahan (Opsional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={inputBaseClass}
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label
          htmlFor="cost"
          className="block text-sm font-medium text-gray-700 mb-0.5"
        >
          Biaya (Rp) (Opsional)
        </label>
        <input
          type="number"
          id="cost"
          value={cost}
          onChange={(e) =>
            setCost(e.target.value === '' ? '' : parseFloat(e.target.value))
          }
          placeholder="e.g., 500000"
          className={inputBaseClass}
          disabled={isSubmitting}
        />
      </div>
      <div className="flex justify-end space-x-3 pt-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 transition-colors disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 border border-transparent rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 transition-all disabled:opacity-70"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Menyimpan...
            </span>
          ) : initialTreatment ? (
            'Simpan Perawatan'
          ) : (
            'Tambah Perawatan'
          )}
        </button>
      </div>
    </form>
  );
};

export default TreatmentForm;
