import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, Outlet } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import DentalChart from './components/DentalChart';
import TreatmentHistory from './components/TreatmentHistory';
import Modal from './components/Modal';
import PatientForm from './components/PatientForm';
import TreatmentForm from './components/TreatmentForm';
import { User, Patient, Treatment, Tooth } from './types';
import { apiService } from './apiService';

// Komponen proteksi route
type ProtectedRouteProps = {
  isAuthenticated: boolean;
  children: React.ReactNode;
};
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Komponen halaman dashboard
type DashboardPageProps = {
  currentUser: Omit<User, 'password'>;
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
  handleLogout: () => void;
  handleSelectPatient: (id: string) => void;
  fetchPatients: () => Promise<void>; // Tambahkan prop untuk fetch ulang pasien
};
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
  handleLogout,
  handleSelectPatient,
  fetchPatients, // tambahkan prop untuk fetch ulang pasien
}) => {
  const [showModal, setShowModal] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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
      setShowModal(false);
      await fetchPatients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambah pasien.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
      {/* Header/Topbar */}
      <header className="bg-white shadow-sm border-b border-gray-100 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Dental Record Pro</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700 hidden sm:block">{currentUser.name || currentUser.email}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all text-sm"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto py-10 px-4">
        {/* Tombol Tambah Pasien */}
        <div className="flex mb-6">
          <button
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all text-sm"
            onClick={() => setShowModal(true)}
          >
            + Tambah Pasien
          </button>
        </div>
        {/* Modal Tambah Pasien */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Tambah Pasien Baru"
          size="md"
        >
          <PatientForm
            onSubmit={handleAddPatient}
            onClose={() => setShowModal(false)}
            isSubmitting={isSubmitting}
          />
          {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
        </Modal>
        {/* Card Selamat Datang */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <div className="h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Selamat Datang, {currentUser.name || currentUser.email}!</h2>
            <p className="text-gray-600 text-sm">Ini adalah dashboard utama aplikasi Dental Record Pro. Silakan pilih menu di bawah untuk mulai menggunakan aplikasi.</p>
          </div>
        </div>
        {/* Card Statistik Dummy */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-300 text-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-3xl font-bold mb-1">{patients.length}</span>
            <span className="text-sm font-medium">Total Pasien</span>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-300 text-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-3xl font-bold mb-1">34</span>
            <span className="text-sm font-medium">Catatan Dental</span>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-300 text-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-3xl font-bold mb-1">5</span>
            <span className="text-sm font-medium">Dokter Aktif</span>
          </div>
        </div>
        {/* Filter & Search */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cari Nama</label>
              <input
                type="text"
                value={filterName}
                onChange={e => setFilterName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
                placeholder="Cari nama pasien..."
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
              <input
                type="text"
                value={filterLocation}
                onChange={e => setFilterLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
                placeholder="Cari lokasi..."
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Umur Min</label>
              <input
                type="number"
                value={filterMinAge}
                onChange={e => setFilterMinAge(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
                placeholder="Min"
                min={0}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Umur Max</label>
              <input
                type="number"
                value={filterMaxAge}
                onChange={e => setFilterMaxAge(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
                placeholder="Max"
                min={0}
              />
            </div>
            <button
              onClick={handleResetFilter}
              className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all text-sm mt-2 sm:mt-0"
            >
              Reset
            </button>
          </div>
          {isLoadingPatients ? (
            <div className="text-center py-8 text-gray-500">Memuat data pasien...</div>
          ) : errorPatients ? (
            <div className="text-center py-8 text-red-500">{errorPatients}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredPatients.map((p) => (
                <button
                  key={p.id}
                  className="bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-100 rounded-xl shadow p-4 text-left hover:shadow-lg transition-all group w-full flex flex-col gap-2 focus:outline-none"
                  onClick={() => handleSelectPatient(p.id)}
                >
                  <div className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-all">{p.name}</div>
                  {/* <div className="text-gray-600 text-sm">{p.email}</div> */}
                  <div className="text-gray-600 text-sm">{p.contact}</div>
                  <div className="text-gray-500 text-xs mt-1">{p.address}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Komponen halaman detail pasien & dental chart
type PatientDetailPageProps = {
  patients: Patient[];
  currentUser: Omit<User, 'password'>;
  handleLogout: () => void;
};
const PatientDetailPage: React.FC<PatientDetailPageProps> = ({ patients, currentUser, handleLogout }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedToothIds, setSelectedToothIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);

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
    if (selectedToothIds.length === 0) {
      // Jika belum ada gigi dipilih, pilih satu gigi default (misal gigi 1)
      // setSelectedToothIds([1]);
    }
    setShowTreatmentModal(true);
  };
  const handleCloseTreatmentModal = () => {
    setShowTreatmentModal(false);
    setSelectedToothIds([]); // reset setelah modal ditutup
  };

  // Handler submit treatment
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
      setShowTreatmentModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambah treatment.');
    } finally {
      setIsSubmitting(false);
    }
  };

    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
      <header className="bg-white shadow-sm border-b border-gray-100 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Dental Record Pro</span>
              </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700 hidden sm:block">{currentUser.name || currentUser.email}</span>
            <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all text-sm"
          >
            Logout
            </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto py-10 px-4">
        <button
          className="mb-6 px-4 py-2 rounded bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition-all text-sm"
          onClick={handleBack}
        >
          &larr; Kembali ke Daftar Pasien
        </button>
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
          isOpen={showTreatmentModal}
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

const App: React.FC = () => {
  // Semua hooks di sini
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<Omit<User, 'password'> | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [errorPatients, setErrorPatients] = useState<string | null>(null);
  const [filterName, setFilterName] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterMinAge, setFilterMinAge] = useState('');
  const [filterMaxAge, setFilterMaxAge] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const navigate = useNavigate();

  // Restore session dari cookie saat mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const user = await apiService.getAuthenticatedUser();
        if (user && isMounted) {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } catch (e) {
        // ignore error, just treat as not authenticated
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Semua handler dan logic utama di bawah sini, tidak ada return lain sebelum akhir komponen
  const handleLoginSuccess = (user: Omit<User, 'password'>) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    navigate('/dashboard');
  };
  const handleRegisterSuccess = () => {
    navigate('/login');
  };
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setPatients([]);
    setFilterName('');
    setFilterLocation('');
    setFilterMinAge('');
    setFilterMaxAge('');
    navigate('/login');
  };

  const fetchPatientsData = async () => {
    setIsLoadingPatients(true);
    setErrorPatients(null);
    try {
      const data = await apiService.fetchPatients();
      setPatients(data);
    } catch (err) {
      setErrorPatients(err instanceof Error ? err.message : 'Gagal memuat data pasien.');
    } finally {
      setIsLoadingPatients(false);
    }
  };
  useEffect(() => {
    if (isAuthenticated) {
      fetchPatientsData();
    }
  }, [isAuthenticated]);

  const getAge = (dob: string | undefined) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const filteredPatients = patients.filter((p) => {
    const nameMatch = p.name.toLowerCase().includes(filterName.toLowerCase());
    const locationMatch = (p.address || '').toLowerCase().includes(filterLocation.toLowerCase());
    const age = getAge(p.date_of_birth);
    let minAgeOk = true;
    let maxAgeOk = true;
    if (filterMinAge) minAgeOk = age !== null ? age >= parseInt(filterMinAge) : false;
    if (filterMaxAge) maxAgeOk = age !== null ? age <= parseInt(filterMaxAge) : false;
    return nameMatch && locationMatch && minAgeOk && maxAgeOk;
  });

  const handleResetFilter = () => {
    setFilterName('');
    setFilterLocation('');
    setFilterMinAge('');
    setFilterMaxAge('');
  };

  const handleSelectPatient = (id: string) => {
    navigate(`/patients/${id}`);
  };

  // Baru return loading state di sini, setelah semua hooks dan useEffect dipanggil
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100">
        <div className="text-lg text-gray-700 font-semibold animate-pulse">Memuat sesi...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthPage>
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          </AuthPage>
        }
      />
      <Route
        path="/register"
        element={
          <AuthPage>
            <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
          </AuthPage>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            {currentUser && (
              <DashboardPage
                currentUser={currentUser}
                patients={patients}
                isLoadingPatients={isLoadingPatients}
                errorPatients={errorPatients}
                filterName={filterName}
                filterLocation={filterLocation}
                filterMinAge={filterMinAge}
                filterMaxAge={filterMaxAge}
                setFilterName={setFilterName}
                setFilterLocation={setFilterLocation}
                setFilterMinAge={setFilterMinAge}
                setFilterMaxAge={setFilterMaxAge}
                handleResetFilter={handleResetFilter}
                filteredPatients={filteredPatients}
                handleLogout={handleLogout}
                handleSelectPatient={handleSelectPatient}
                fetchPatients={fetchPatientsData}
              />
            )}
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/:id"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            {currentUser && (
              <PatientDetailPage
                patients={patients}
                currentUser={currentUser}
                handleLogout={handleLogout}
              />
            )}
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
