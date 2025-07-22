import { Patient, Treatment, Tooth, User, AuthResponse, DentalRecord } from './types';


const API_BASE_URL = 'https://dentalpro-1qm45y7no-multiverse88s-projects.vercel.app/api';
const AUTH_TOKEN_KEY = 'dentalAppAuthToken';
const AUTH_USER_KEY = 'dentalAppAuthUser';

// Helper to set cookie
const setCookie = (name: string, value: string, hours: number) => {
  const d = new Date();
  d.setTime(d.getTime() + hours * 60 * 60 * 1000);
  const expires = 'expires=' + d.toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
};

// Helper to get cookie
const getCookie = (name: string): string | null => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
};

// Helper to delete cookie
const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Helper to get stored auth token
const getAuthToken = (): string | null => {
  return getCookie(AUTH_TOKEN_KEY);
};

// Helper to handle API responses
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  if (response.status === 204) {
    // No Content
    return null;
  }
  return response.json();
};

export const apiService = {
  // --- Auth API ---
  registerUser: async (
    userData: Pick<User, 'name' | 'email' | 'password'>
  ): Promise<Omit<User, 'password_hash'>> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const authResponse: AuthResponse = await handleApiResponse(response);
    // Registration doesn't return a token directly for login, just success
    return authResponse.user;
  },

  loginUser: async (
    credentials: Pick<User, 'email' | 'password'>
  ): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const authResponse: AuthResponse = await handleApiResponse(response);
    if (authResponse.token && authResponse.user) {
      setCookie(AUTH_TOKEN_KEY, authResponse.token, 12);
      setCookie(AUTH_USER_KEY, JSON.stringify(authResponse.user), 12);
    }
    return authResponse;
  },

  logoutUser: async (): Promise<void> => {
    deleteCookie(AUTH_TOKEN_KEY);
    deleteCookie(AUTH_USER_KEY);
    return Promise.resolve();
  },

  getAuthenticatedUser: async (): Promise<Omit<User, 'password_hash'> | null> => {
    const token = getAuthToken();
    const userJson = getCookie(AUTH_USER_KEY);
    if (token && userJson) {
      try {
        return JSON.parse(userJson) as Omit<User, 'password_hash'>;
      } catch (e) {
        deleteCookie(AUTH_TOKEN_KEY);
        deleteCookie(AUTH_USER_KEY);
        return null;
      }
    }
    return null;
  },

  // --- Patient API ---
  fetchPatients: async (): Promise<Patient[]> => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/patients`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleApiResponse(response);
  },

  fetchPatientById: async (patientId: string): Promise<Patient> => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleApiResponse(response);
  },

  addPatient: async (
    patientData: Pick<Patient, 'name' | 'date_of_birth' | 'gender' | 'contact' | 'address'>
  ): Promise<Patient> => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(patientData),
    });
    return handleApiResponse(response);
  },

  updatePatient: async (
    patientId: string,
    patientData: Patient
  ): Promise<Patient> => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(patientData),
    });
    return handleApiResponse(response);
  },

  deletePatient: async (patientId: string): Promise<void> => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await handleApiResponse(response);
  },

  // --- Treatment and Teeth operations ---
  addTreatment: async (
    patientId: string,
    treatmentData: Omit<Treatment, 'id' | 'patient_id'> & { toothIds: number[] },
    updatedTeeth: Tooth[]
  ): Promise<Patient> => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication token not found.');

    const response = await fetch(`${API_BASE_URL}/treatments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...treatmentData, patient_id: patientId }),
    });
    await handleApiResponse(response);

    // Update patient teeth status after treatment
    await apiService.updatePatientTeeth(patientId, updatedTeeth);

    // Re-fetch patient to get updated treatments and teeth
    return apiService.fetchPatientById(patientId);
  },

  updateTreatment: async (
    patientId: string,
    updatedTreatmentData: Treatment & { toothIds: number[] },
    updatedTeeth: Tooth[]
  ): Promise<Patient> => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication token not found.');

    const response = await fetch(`${API_BASE_URL}/treatments/${updatedTreatmentData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedTreatmentData),
    });
    await handleApiResponse(response);

    // Update patient teeth status after treatment
    await apiService.updatePatientTeeth(patientId, updatedTeeth);

    // Re-fetch patient to get updated treatments and teeth
    return apiService.fetchPatientById(patientId);
  },

  deleteTreatment: async (
    patientId: string,
    treatmentId: string
  ): Promise<Patient> => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication token not found.');

    const response = await fetch(`${API_BASE_URL}/treatments/${treatmentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await handleApiResponse(response);

    // Re-fetch patient to get updated treatments
    return apiService.fetchPatientById(patientId);
  },

  updatePatientTeeth: async (
    patientId: string,
    teeth: Tooth[]
  ): Promise<Patient> => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication token not found.');

    // The backend patient PUT endpoint handles teeth updates directly
    const patient = await apiService.fetchPatientById(patientId);
    const updatedPatientData = { ...patient, teeth };

    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedPatientData),
    });
    return handleApiResponse(response);
  },

  // --- Dental Records API ---
  fetchDentalRecords: async (patientId: string): Promise<DentalRecord[]> => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication token not found.');
    const response = await fetch(
      `${API_BASE_URL}/records?patientId=${patientId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return handleApiResponse(response);
  },

  addDentalRecord: async (
    patientId: string,
    recordData: Omit<DentalRecord, 'id' | 'patient_id'>
  ): Promise<DentalRecord> => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication token not found.');

    const response = await fetch(
      `${API_BASE_URL}/records`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...recordData, patient_id: patientId }),
      }
    );
    return handleApiResponse(response);
  },
};