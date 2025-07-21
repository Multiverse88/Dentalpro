import React, { useState, useMemo } from 'react';
import { Patient } from '../types';
import PatientListItem from './PatientListItem';

interface PatientListProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onEditPatient: (patient: Patient) => void;
}

const PatientList: React.FC<PatientListProps> = ({ patients, onSelectPatient, onEditPatient }: PatientListProps) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [filterGender, setFilterGender] = useState('all');
  const getAge = (dob: string | undefined) => {
    if (!dob) return null;
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };
  const filteredPatients = useMemo(() => {
    const s = search.trim().toLowerCase();
    let result = patients;
    if (filterGender !== 'all') {
      result = result.filter((p) => (p.gender || '').toLowerCase() === filterGender);
    }
    if (s) {
      result = result.filter((p) => {
        const age = getAge(p.date_of_birth);
        return (
          ((p.name || '').toLowerCase().includes(s)) ||
          ((p.address || '').toLowerCase().includes(s)) ||
          ((p.contact || '').toLowerCase().includes(s)) ||
          (age !== null && s === age.toString())
        );
      });
    }
    // Sorting
    return result.slice().sort((a, b) => {
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'age-asc') return (getAge(a.date_of_birth) || 0) - (getAge(b.date_of_birth) || 0);
      if (sortBy === 'age-desc') return (getAge(b.date_of_birth) || 0) - (getAge(a.date_of_birth) || 0);
      return 0;
    });
  }, [patients, search, sortBy, filterGender]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4 items-end">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama, alamat, kontak, atau umur..."
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-base shadow-sm"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl bg-white text-base shadow-sm"
        >
          <option value="name-asc">Nama A-Z</option>
          <option value="name-desc">Nama Z-A</option>
          <option value="age-desc">Umur Tua-Muda</option>
          <option value="age-asc">Umur Muda-Tua</option>
        </select>
        <select
          value={filterGender}
          onChange={e => setFilterGender(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl bg-white text-base shadow-sm"
        >
          <option value="all">Semua Gender</option>
          <option value="male">Laki-laki</option>
          <option value="female">Perempuan</option>
        </select>
      </div>
      {filteredPatients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Tidak ada pasien.</div>
      ) : (
        <ul className="space-y-4">
          {filteredPatients.map((patient: Patient) => (
            <PatientListItem
              key={patient.id}
              patient={patient}
              onSelectPatient={onSelectPatient}
              onEditPatient={onEditPatient}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientList; 