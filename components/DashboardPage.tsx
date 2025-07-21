import React from 'react';
import Modal from './Modal';
import PatientForm from './PatientForm';
import TreatmentHistory from './TreatmentHistory';
import DentalChart from './DentalChart';
import { Patient, Treatment, Tooth, DentalRecord } from '../types';

interface DashboardPageProps {
  currentUser: { name?: string; email?: string };
  patients: Patient[];
  isLoadingPatients: boolean;
  errorPatients: string | null;
  filterName: string;
  filterLocation: string;
  filterMinAge: string;
  filterMaxAge: string;
  setFilterName: (v: string) => void;
  setFilterLocation: (v: string) => void;
  setFilterMinAge: (v: string) => void;
  setFilterMaxAge: (v: string) => void;
  handleResetFilter: () => void;
  filteredPatients: Patient[];
  handleSelectPatient: (id: string) => void;
  fetchPatients: () => Promise<void>;
  apiService: any;
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser,
  patients,
  isLoadingPatients,
  errorPatients,
  filterName,
  filterLocation,
  filterMinAge,
  filterMaxAge,
  setFilterName,
  setFilterLocation,
  setFilterMinAge,
  setFilterMaxAge,
  handleResetFilter,
  filteredPatients,
  handleSelectPatient,
  fetchPatients,
  apiService,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeModal, setActiveModal] = React.useState<null | 'addPatient' | 'treatmentDetail'>(null);
  const [selectedTreatment, setSelectedTreatment] = React.useState<any>(null);
  const dentalRecordCount = patients.reduce((total, p) => total + (p.treatments?.length || 0), 0);

  // Handler submit pasien baru
  const handleAddPatient = async (patient: Patient) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiService.addPatient({
        name: patient.name,
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        contact: patient.contact,
        address: patient.address,
      });
      await fetchPatients();
      setActiveModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambah pasien.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ambil treatment terakhir dari semua pasien
  const allTreatments: (Treatment & { patientName: string })[] = patients
    .flatMap((p) => (p.treatments || []).map((t) => ({ ...t, patientName: p.name })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestTreatments = allTreatments.slice(0, 5);

  return (
    <main className="flex-1 p-8 bg-gray-50">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow flex items-center gap-4 p-6">
          <span className="bg-blue-100 text-blue-600 p-3 rounded-lg text-2xl">👥</span>
          <div>
            <div className="text-2xl font-bold">{patients.length}</div>
            <div className="text-gray-500">Total Pasien</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow flex items-center gap-4 p-6">
          <span className="bg-purple-100 text-purple-600 p-3 rounded-lg text-2xl">📝</span>
          <div>
            <div className="text-2xl font-bold">{dentalRecordCount}</div>
            <div className="text-gray-500">Catatan Dental</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow flex items-center gap-4 p-6">
          <span className="bg-pink-100 text-pink-600 p-3 rounded-lg text-2xl">👨‍⚕️</span>
          <div>
            <div className="text-2xl font-bold">5</div>
            <div className="text-gray-500">Dokter Aktif</div>
          </div>
        </div>
      </div>
      {/* Filter/Search Bar */}
      <form className="flex flex-row gap-4 mb-8 items-end" onSubmit={e => e.preventDefault()}>
        <input
          type="text"
          value={filterName}
          onChange={e => setFilterName(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-base shadow-sm"
          placeholder="Cari nama, lokasi, atau umur..."
        />
        <button type="button" onClick={handleResetFilter} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all text-base shadow">Reset</button>
        <button type="button" onClick={() => setActiveModal('addPatient')} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow hover:from-blue-700 hover:to-purple-700 transition-all text-base">+ Tambah Pasien</button>
      </form>
      {/* Treatment Terakhir (pindah ke bawah) */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Treatment Terakhir</h2>
        {latestTreatments.length === 0 ? (
          <div className="text-gray-500">Belum ada treatment.</div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gigi</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Prosedur</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Catatan</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama Pasien</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {latestTreatments.map((t) => (
                  <tr key={t.id} className="cursor-pointer hover:bg-blue-50" onClick={() => { setSelectedTreatment(t); setActiveModal('treatmentDetail'); }}>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{t.date ? new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      <div className="flex flex-wrap gap-1">
                        {t.toothIds && t.toothIds.sort((a, b) => a - b).map((id) => (
                          <span key={id} className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-0.5 rounded-full">{id}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-800 font-medium">{t.procedure}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 max-w-xs"><p className="truncate w-full">{t.notes || <span className="text-gray-400">-</span>}</p></td>
                    <td className="px-5 py-4 text-sm text-gray-700">{t.patientName || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Modal Tambah Pasien */}
      <Modal isOpen={activeModal === 'addPatient'} onClose={() => setActiveModal(null)} title="Tambah Pasien Baru" size="md">
        <PatientForm onSubmit={handleAddPatient} onClose={() => setActiveModal(null)} isSubmitting={isSubmitting} />
        {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
      </Modal>
      {/* Modal detail treatment terakhir */}
      <Modal isOpen={activeModal === 'treatmentDetail'} onClose={() => setActiveModal(null)} title="Detail Treatment Terakhir" size="xl">
        {selectedTreatment && (
          <div className="space-y-2 text-gray-800">
            <div><span className="font-semibold">Nama Pasien:</span> {selectedTreatment.patientName}</div>
            <div><span className="font-semibold">Tanggal:</span> {selectedTreatment.date ? new Date(selectedTreatment.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</div>
            {/* Info nama gigi */}
            <div>
              <span className="font-semibold">Nama Gigi:</span> {
                (() => {
                  const teeth = (patients.find(p => p.name === selectedTreatment.patientName)?.teeth) || [];
                  if (!selectedTreatment.toothIds || selectedTreatment.toothIds.length === 0) return '-';
                  const names = selectedTreatment.toothIds.map((id: number) => {
                    const tooth = teeth.find(t => t.id === id);
                    return tooth ? tooth.name.replace(/^Gigi /i, '') : `Gigi ${id}`;
                  });
                  return names.join(', ');
                })()
              }
            </div>
            <div><span className="font-semibold">Prosedur:</span> {selectedTreatment.procedure}</div>
            <div><span className="font-semibold">Catatan:</span> {selectedTreatment.notes || '-'}</div>
            {/* Peta Gigi */}
            <div className="mt-4">
              <span className="font-semibold block mb-2">Peta Gigi:</span>
              <div className="overflow-x-auto">
                <DentalChart
                  teeth={(patients.find(p => p.name === selectedTreatment.patientName)?.teeth) || []}
                  selectedToothIds={selectedTreatment.toothIds || []}
                  onToothClick={() => {}}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
};

export default DashboardPage; 