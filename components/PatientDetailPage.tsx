import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Patient, User, Treatment, Tooth } from '../types';
import DentalChart from './DentalChart';
import Modal from './Modal';
import TreatmentForm from './TreatmentForm';
import TreatmentHistory from './TreatmentHistory';
import { apiService } from '../apiService';

interface PatientDetailPageProps {
  patients: Patient[];
  currentUser: Omit<User, 'password'>;
  handleLogout: () => void;
}

const PatientDetailPage: React.FC<PatientDetailPageProps> = ({ patients, currentUser, handleLogout }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedToothIds, setSelectedToothIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeModal, setActiveModal] = useState<null | 'treatment'>(null);

  useEffect(() => {
    const p = patients.find((p) => String(p.id) === String(id));
    setPatient(p || null);
  }, [patients, id]);

  if (!patient) return <div className="p-8 text-center text-red-500">Pasien tidak ditemukan.</div>;
  const handleBack = () => navigate('/dashboard');
  const handleToothClick = (toothId: number) => {
    setSelectedToothIds((prev) =>
      prev.includes(toothId)
        ? prev.filter((id) => id !== toothId)
        : [...prev, toothId]
    );
  };

  const handleOpenTreatmentModal = () => {
    setActiveModal('treatment');
  };
  const handleCloseTreatmentModal = () => {
    setActiveModal(null);
    setSelectedToothIds([]);
  };

  const handleAddTreatment = async (treatment: Treatment, updatedTeeth: Tooth[]) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const updatedPatient = await apiService.addTreatment(
        patient.id,
        {
          date: treatment.date,
          toothIds: treatment.toothIds,
          procedure: treatment.procedure,
          notes: treatment.notes,
          cost: treatment.cost,
        },
        updatedTeeth
      );
      setPatient(updatedPatient);
      setActiveModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambah treatment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
      <main className="max-w-4xl mx-auto py-10 px-4">
        <button
          className="mb-6 px-4 py-2 rounded bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition-all text-sm"
          onClick={handleBack}
        >
          &larr; Kembali ke Daftar Pasien
        </button>
        {/* Biodata Pasien */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Data Pasien</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-700">
            <div><span className="font-semibold">Nama:</span> {patient.name}</div>
            <div><span className="font-semibold">ID:</span> {patient.id}</div>
            <div><span className="font-semibold">Tanggal Lahir:</span> {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString('id-ID') : '-'}</div>
            <div><span className="font-semibold">Gender:</span> {patient.gender === 'Male' ? 'Laki-laki' : patient.gender === 'Female' ? 'Perempuan' : 'Lainnya'}</div>
            <div><span className="font-semibold">Kontak:</span> {patient.contact || '-'}</div>
            <div><span className="font-semibold">Alamat:</span> {patient.address || '-'}</div>
          </div>
        </div>
        {/* Dental Chart */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold mb-2 text-gray-900">Peta Gigi: {patient.name}</h2>
          <DentalChart
            teeth={patient.teeth || []}
            selectedToothIds={selectedToothIds}
            onToothClick={handleToothClick}
          />
        </div>
        {/* Tombol Treatment & Treatment History */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Riwayat Perawatan</h2>
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all text-sm"
              onClick={handleOpenTreatmentModal}
            >
              + Treatment
            </button>
          </div>
          <TreatmentHistory
            treatments={patient.treatments || []}
            teeth={patient.teeth || []}
            onEditTreatment={() => {}}
            onDeleteTreatment={() => {}}
          />
        </div>
        {/* Modal TreatmentForm */}
        <Modal
          isOpen={activeModal === 'treatment'}
          onClose={handleCloseTreatmentModal}
          title="Tambah Treatment Gigi"
          size="md"
        >
          <TreatmentForm
            patient={patient}
            onSubmit={handleAddTreatment}
            onClose={handleCloseTreatmentModal}
            isSubmitting={isSubmitting}
            defaultSelectedToothIds={selectedToothIds}
          />
          {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
        </Modal>
      </main>
    </div>
  );
};

export default PatientDetailPage; 