import React, { useState, useEffect, useRef } from 'react';
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
import gsap from 'gsap';
import CalendarPage from './components/CalendarPage';
import DashboardPage from './components/DashboardPage';
import PatientList from './components/PatientList';

// Toast notification
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, background: '#4f46e5', color: '#fff', padding: '14px 28px', borderRadius: 12, fontWeight: 600, fontSize: 16, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)' }}>{message}</div>
  );
}

function AppointmentForm({ initial, onSave, onCancel, loading }: any) {
  const [form, setForm] = React.useState(initial || { patient: '', note: '', day: 0, hour: 9, status: 'Checked-in' });
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <input required placeholder="Nama Pasien" value={form.patient} onChange={e => setForm((f: any) => ({ ...f, patient: e.target.value }))} />
      <input placeholder="Catatan" value={form.note} onChange={e => setForm((f: any) => ({ ...f, note: e.target.value }))} />
      <div style={{ display: 'flex', gap: 8 }}>
        <select value={form.day} onChange={e => setForm((f: any) => ({ ...f, day: +e.target.value }))}>{['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'].map((d,i)=>(<option key={i} value={i}>{d}</option>))}</select>
        <select value={form.hour} onChange={e => setForm((f: any) => ({ ...f, hour: +e.target.value }))}>{Array.from({length:10},(_,i)=>9+i).map(h=>(<option key={h} value={h}>{h}:00</option>))}</select>
        <select value={form.status} onChange={e => setForm((f: any) => ({ ...f, status: e.target.value }))}><option>Checked-in</option><option>Info</option></select>
      </div>
      <button type="submit" disabled={loading} style={{ background: 'linear-gradient(90deg,#4f46e5,#0ea5e9)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 600 }}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
      <button type="button" onClick={onCancel} style={{ background: '#f1f5f9', color: '#4f46e5', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 600 }}>Batal</button>
    </form>
  );
}

function QueueForm({ initial, onSave, onCancel, loading }: any) {
  const [form, setForm] = React.useState(initial || { patient: '', note: '', status: 'Checked-in' });
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <input required placeholder="Nama Pasien" value={form.patient} onChange={e => setForm((f: any) => ({ ...f, patient: e.target.value }))} />
      <input placeholder="Catatan" value={form.note} onChange={e => setForm((f: any) => ({ ...f, note: e.target.value }))} />
      <select value={form.status} onChange={e => setForm((f: any) => ({ ...f, status: e.target.value }))}><option>Checked-in</option><option>Info</option></select>
      <button type="submit" disabled={loading} style={{ background: 'linear-gradient(90deg,#4f46e5,#0ea5e9)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 600 }}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
      <button type="button" onClick={onCancel} style={{ background: '#f1f5f9', color: '#4f46e5', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 600 }}>Batal</button>
    </form>
  );
}

// Komponen proteksi route
type ProtectedRouteProps = {
  isAuthenticated: boolean;
  children: React.ReactNode;
};
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
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
  const [activeModal, setActiveModal] = React.useState<null | 'treatment'>(null);

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
    setActiveModal('treatment');
  };
  const handleCloseTreatmentModal = () => {
    setActiveModal(null);
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
            currentUser={currentUser!}
          />
          {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
        </Modal>
      </main>
      </div>
    );
  };

type Appointment = { id: number; day: number; hour: number; patient: string; note: string; status: string };
type QueueItem = { id: number; patient: string; status: string; note: string };
function CalendarWeekView() {
  // Dummy data
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 10 }, (_, i) => 9 + i); // 09:00 - 18:00
  const [appointments, setAppointments] = React.useState<Appointment[]>([
    { id: 1, day: 2, hour: 10, patient: 'Juanita S.', note: 'Need braces', status: 'Checked-in' },
    { id: 2, day: 2, hour: 12, patient: 'Vanessa R.', note: 'Extraction #38', status: 'Checked-in' },
    { id: 3, day: 4, hour: 16, patient: 'Out of office', note: '', status: 'Info' },
  ]);
  const [queue, setQueue] = React.useState<QueueItem[]>([
    { id: 1, patient: 'Juanita S.', status: 'Checked-in', note: 'Need braces' },
    { id: 2, patient: 'Vanessa R.', status: 'Checked-in', note: 'Extraction #38' },
  ]);
  const [selectedAppt, setSelectedAppt] = React.useState<Appointment | null>(null);
  const [editAppt, setEditAppt] = React.useState<Appointment | null>(null);
  const [formLoading, setFormLoading] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [editQueue, setEditQueue] = React.useState<QueueItem | null>(null);
  const calendarRef = useRef(null);
  const [activeModal, setActiveModal] = React.useState<null | 'detail' | 'form' | 'queueDetail' | 'queueForm'>(null);
  const [selectedQueue, setSelectedQueue] = React.useState<QueueItem | null>(null);

  // GSAP animasi masuk
  React.useEffect(() => {
    if (calendarRef.current) {
      gsap.from(calendarRef.current, { opacity: 0, y: 40, duration: 0.7, ease: 'power3.out' });
    }
  }, []);

  // Handler CRUD Appointment
  const handleAddAppt = (day: number, hour: number) => {
    setEditAppt({ id: 0, patient: '', note: '', day, hour, status: 'Checked-in' });
    setActiveModal('form');
  };
  const handleSaveAppt = (data: Appointment) => {
    setFormLoading(true);
    setTimeout(() => {
      setAppointments(appts => {
        if (data.id === 0) {
          const newId = Math.max(0, ...appts.map(a => a.id)) + 1;
          return [...appts, { ...data, id: newId }];
        } else {
          return appts.map(a => a.id === data.id ? data : a);
        }
      });
      setActiveModal(null);
      setEditAppt(null);
      setFormLoading(false);
      setToast(data.id === 0 ? 'Appointment ditambahkan!' : 'Appointment diupdate!');
    }, 700);
  };
  const handleEditAppt = (appt: Appointment) => {
    setEditAppt(appt);
    setActiveModal('form');
  };
  const handleDeleteAppt = (id: number) => {
    setAppointments(appts => appts.filter(a => a.id !== id));
    setActiveModal(null);
    setToast('Appointment dihapus!');
  };
  // Handler CRUD Queue
  const handleCheckIn = (appt: Appointment) => {
    setQueue(q => [...q, { id: Math.max(0, ...q.map(x => x.id)) + 1, patient: appt.patient, status: appt.status, note: appt.note }]);
    setToast('Check-in ke antrian!');
  };
  const handleEditQueue = (q: QueueItem) => {
    setEditQueue(q);
    setActiveModal('queueForm');
  };
  const handleSaveQueue = (data: QueueItem) => {
    setFormLoading(true);
    setTimeout(() => {
      setQueue(qs => {
        if (!editQueue) {
          const newId = Math.max(0, ...qs.map(x => x.id)) + 1;
          return [...qs, { ...data, id: newId }];
        } else {
          return qs.map(x => x.id === editQueue.id ? { ...data, id: editQueue.id } : x);
        }
      });
      setActiveModal(null);
      setEditQueue(null);
      setFormLoading(false);
      setToast(editQueue ? 'Antrian diupdate!' : 'Antrian ditambahkan!');
    }, 700);
  };
  const handleDeleteQueue = (id: number) => {
    setQueue(qs => qs.filter(x => x.id !== id));
    setActiveModal(null);
    setToast('Antrian dihapus!');
  };

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <div ref={calendarRef} className="dashboard-calendar" style={{ flex: 1, minWidth: 0, overflowX: 'auto', padding: 24 }}>
        {/* Calendar header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 20, color: '#232b3b' }}>Calendar</span>
            <span style={{ background: '#f1f5f9', color: '#4f46e5', borderRadius: 8, padding: '4px 14px', fontWeight: 600, fontSize: 15 }}>Jul 13, 2025 - Jul 19, 2025</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ background: '#f1f5f9', color: '#4f46e5', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600 }}>Day</button>
            <button style={{ background: 'linear-gradient(90deg,#4f46e5,#0ea5e9)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 700 }}>Week</button>
            <button style={{ background: '#f1f5f9', color: '#4f46e5', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600 }}>Month</button>
          </div>
        </div>
        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(7, 1fr)`, borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#fff' }}>
          {/* Header row */}
          <div style={{ background: '#f1f5f9', color: '#4f46e5', fontWeight: 700, fontSize: 15, padding: '10px 0', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Time</div>
          {days.map((d, i) => (
            <div key={i} style={{ background: '#f1f5f9', color: '#4f46e5', fontWeight: 700, fontSize: 15, padding: '10px 0', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>{d}</div>
          ))}
          {/* Time rows */}
          {hours.map((h, rowIdx) => [
            <div key={`time-${h}`} style={{ background: '#fff', color: '#64748b', fontWeight: 600, fontSize: 15, padding: '12px 0', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>{h.toString().padStart(2, '0')}:00</div>,
            ...days.map((_, colIdx) => {
              const appt = appointments.find(a => a.day === colIdx && a.hour === h);
              return (
                <div key={`cell-${rowIdx}-${colIdx}`} style={{ position: 'relative', minHeight: 48, borderBottom: '1px solid #e5e7eb', borderRight: colIdx === 6 ? 'none' : '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}
                  onClick={() => appt ? (setSelectedAppt(appt), setActiveModal('detail')) : handleAddAppt(colIdx, h)}>
                  {appt && (
                    <div style={{ position: 'absolute', left: 8, right: 8, top: 6, background: '#e0e7ff', color: '#232b3b', borderRadius: 8, padding: '8px 10px', fontWeight: 600, fontSize: 14, boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)' }}>
                      <div>{appt.patient}</div>
                      {appt.note && <div style={{ fontSize: 12, color: '#4f46e5', fontWeight: 400 }}>{appt.note}</div>}
                    </div>
                  )}
                </div>
              );
            })
          ])}
        </div>
        {/* Modal detail appointment */}
        <Modal isOpen={activeModal === 'detail'} onClose={() => { setActiveModal(null); }} title="Detail Appointment" size="sm">
          {selectedAppt && (
            <div style={{ color: '#232b3b' }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{selectedAppt.patient}</div>
              <div style={{ marginBottom: 4 }}>Status: <b>{selectedAppt.status}</b></div>
              <div style={{ marginBottom: 4 }}>Waktu: <b>{hours[selectedAppt.hour - 9]}:00</b></div>
              <div style={{ marginBottom: 4 }}>Catatan: <b>{selectedAppt.note || '-'}</b></div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button onClick={() => handleEditAppt(selectedAppt)} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600 }}>Edit</button>
                <button onClick={() => handleDeleteAppt(selectedAppt.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600 }}>Hapus</button>
                <button onClick={() => handleCheckIn(selectedAppt)} style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600 }}>Check-in</button>
                <button onClick={() => setActiveModal(null)} style={{ background: '#f1f5f9', color: '#4f46e5', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600 }}>Tutup</button>
              </div>
            </div>
          )}
        </Modal>
        {/* Modal form tambah/edit appointment */}
        <Modal isOpen={activeModal === 'form'} onClose={() => { setActiveModal(null); setEditAppt(null); }} title={editAppt && editAppt.id === 0 ? 'Tambah Appointment' : 'Edit Appointment'} size="sm">
          <AppointmentForm initial={editAppt} onSave={handleSaveAppt} onCancel={() => { setActiveModal(null); setEditAppt(null); }} loading={formLoading} />
        </Modal>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </div>
      {/* Right panel queue */}
      <div className="dashboard-queue-panel" style={{ minWidth: 320, maxWidth: 360, marginLeft: 0, background: '#fff', color: '#232b3b' }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18, color: '#4f46e5' }}>Queue</div>
        {queue.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: 15 }}>No Data</div>
        ) : (
          queue.map((q) => (
            <div key={q.id} style={{ background: '#f1f5f9', borderRadius: 8, padding: '12px 16px', marginBottom: 12, cursor: 'pointer', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}
              onClick={() => { setSelectedQueue(q); setActiveModal('queueDetail'); }}>
              <div style={{ fontWeight: 600, color: '#232b3b' }}>{q.patient}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{q.note}</div>
              <div style={{ fontSize: 12, color: '#4f46e5', fontWeight: 500 }}>{q.status}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={e => { e.stopPropagation(); handleEditQueue(q); setActiveModal('queueForm'); }} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 12px', fontWeight: 600, fontSize: 13 }}>Edit</button>
                <button onClick={e => { e.stopPropagation(); handleDeleteQueue(q.id); }} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 12px', fontWeight: 600, fontSize: 13 }}>Hapus</button>
              </div>
            </div>
          ))
        )}
        {/* Modal detail queue */}
        <Modal isOpen={activeModal === 'queueDetail'} onClose={() => { setActiveModal(null); setSelectedQueue(null); }} title="Detail Antrian" size="sm">
          {selectedQueue && (
            <div style={{ color: '#232b3b' }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{selectedQueue.patient}</div>
              <div style={{ marginBottom: 4 }}>Status: <b>{selectedQueue.status}</b></div>
              <div style={{ marginBottom: 4 }}>Catatan: <b>{selectedQueue.note || '-'}</b></div>
              <button onClick={() => { setActiveModal(null); setSelectedQueue(null); }} style={{ marginTop: 16, background: 'linear-gradient(90deg,#4f46e5,#0ea5e9)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600 }}>Tutup</button>
            </div>
          )}
        </Modal>
        {/* Modal form tambah/edit queue */}
        <Modal isOpen={activeModal === 'queueForm'} onClose={() => { setActiveModal(null); setEditQueue(null); }} title={editQueue ? 'Edit Antrian' : 'Tambah Antrian'} size="sm">
          <QueueForm initial={editQueue} onSave={handleSaveQueue} onCancel={() => { setActiveModal(null); setEditQueue(null); }} loading={formLoading} />
        </Modal>
      </div>
    </div>
  );
}

const App: React.FC = () => {
  // Semua hooks di sini
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<Omit<User, 'password'> | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [errorPatients, setErrorPatients] = useState<string | null>(null);
  const [filterName, setFilterName] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [sidebarActive, setSidebarActive] = useState('dashboard');
  const [activeModal, setActiveModal] = React.useState<null | 'addPatient' | 'treatment' | 'detail' | 'form' | 'queueDetail' | 'queueForm'>(null);

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
    const locationMatch = (p.address || '').toLowerCase().includes(filterName.toLowerCase()); // Changed to filterName for consistency
    const age = getAge(p.date_of_birth);
    let minAgeOk = true;
    let maxAgeOk = true;
    if (filterName) minAgeOk = age !== null ? age >= parseInt(filterName) : false; // Changed to filterName for consistency
    if (filterName) maxAgeOk = age !== null ? age <= parseInt(filterName) : false; // Changed to filterName for consistency
    return nameMatch && locationMatch && minAgeOk && maxAgeOk;
  });

  const handleResetFilter = () => {
    setFilterName('');
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
      {/* Route login dan register tetap tanpa proteksi */}
      <Route
        path="/login"
        element={
          <AuthPage>
            <LoginForm
              onLogin={async (username, password) => {
                try {
                  const authResponse = await apiService.loginUser({ email: username, password });
                  handleLoginSuccess(authResponse.user);
                } catch (err) {
                  // Optionally, you can show an error toast or pass error to LoginForm
                  // For now, do nothing (LoginForm will handle its own error state)
                }
              }}
            />
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
      {/* Semua route lain dibungkus ProtectedRoute */}
      <Route
        path="/*"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <div className="min-h-screen bg-gray-50 flex">
              {/* Sidebar */}
              <aside className="w-64 bg-white border-r flex flex-col items-center py-8 shadow-lg">
                <div className="flex items-center gap-2 mb-10">
                  <span className="text-2xl text-blue-600 font-extrabold">🦷</span>
                  <span className="text-xl font-bold text-gray-900">DentalPro</span>
                </div>
                <nav className="flex flex-col gap-2 w-full px-4">
                  <button className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold ${sidebarActive === 'dashboard' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`} onClick={() => { setSidebarActive('dashboard'); navigate('/dashboard'); }}><span>🏠</span>Dashboard</button>
                  <button className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold ${sidebarActive === 'patients' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`} onClick={() => { setSidebarActive('patients'); navigate('/patients'); }}><span>👤</span>Pasien</button>
                  <button className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold ${sidebarActive === 'calendar' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`} onClick={() => { setSidebarActive('calendar'); navigate('/calendar'); }}><span>📅</span>Kalender</button>
                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 mt-8"><span>🚪</span>Logout</button>
                </nav>
              </aside>
              {/* Main Content */}
              <div className="flex-1 flex flex-col min-h-screen">
                {/* Header */}
                <header className="flex items-center justify-between bg-white px-8 py-4 border-b shadow-sm">
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                  <div className="flex items-center gap-4">
                    <input type="text" placeholder="Search..." className="px-4 py-2 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-blue-400" />
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">{currentUser?.name || currentUser?.email}</span>
                      <span className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">{(currentUser?.name || currentUser?.email || 'U')[0]}</span>
                    </div>
                  </div>
                </header>
                {/* Stat Cards */}
                <main className="flex-1 p-8 bg-gray-50">
                  <Routes>
                    <Route
                      path="/dashboard"
                      element={
                        <DashboardPage
                          currentUser={currentUser || {}}
                          patients={patients}
                          isLoadingPatients={isLoadingPatients}
                          errorPatients={errorPatients}
                          filterName={filterName}
                          filterLocation={filterName}
                          filterMinAge={filterName}
                          filterMaxAge={filterName}
                          setFilterName={setFilterName}
                          setFilterLocation={setFilterName}
                          setFilterMinAge={setFilterName}
                          setFilterMaxAge={setFilterName}
                          handleResetFilter={handleResetFilter}
                          filteredPatients={filteredPatients}
                          handleSelectPatient={handleSelectPatient}
                          fetchPatients={fetchPatientsData}
                          apiService={apiService}
                        />
                      }
                    />
                    <Route
                      path="/patients"
                      element={
                        <PatientList
                          patients={patients}
                          onSelectPatient={handleSelectPatient}
                          onEditPatient={() => {}}
                        />
                      }
                    />
                    <Route
                      path="/calendar"
                      element={<CalendarPage patients={patients} />}
                    />
                    <Route
                      path="/patients/:id"
                      element={
                        <PatientDetailPage
                          patients={patients}
                          currentUser={currentUser!}
                          handleLogout={handleLogout}
                        />
                      }
                    />
                  </Routes>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
