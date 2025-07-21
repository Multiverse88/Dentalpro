export enum ToothStatus {
  Healthy = 'Healthy',
  Decay = 'Decay',
  Filled = 'Filled',
  Extracted = 'Extracted',
  RootCanal = 'RootCanal',
  Crown = 'Crown',
  Missing = 'Missing', // Congenitally missing or prior to record
}

export interface Tooth {
  id: number; // Universal Numbering System (1-32)
  name: string; // e.g., "Upper Right Wisdom Tooth"
  status: ToothStatus;
  quadrant: 'UR' | 'UL' | 'LR' | 'LL'; // UpperRight, UpperLeft, LowerRight, LowerLeft
}

export interface Treatment {
  id: string;
  date: string; // ISO date string
  toothIds: number[];
  procedure: string;
  notes?: string;
  cost?: number;
  performedBy?: string; // Nama orang yang melakukan treatment
}

export interface Patient {
  id: string;
  name: string;
  date_of_birth: string; // ISO date string, used in frontend
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  address?: string;
  teeth: Tooth[];
  treatments: Treatment[];
  created_at: string; // ISO date string
}

export interface OptionType {
  value: string;
  label: string;
}

// Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Only used for mock registration/login, not stored in frontend state after login
  password_hash?: string; // For backend internal use
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password' | 'password_hash'>; // Assuming API returns user details on login
}

// New Dental Record Type
export interface DentalRecord {
  id: string; // Assigned by the backend
  patient_id: string;
  tooth_number: number;
  treatment_date: string; // ISO date string
  description: string;
  treatment_type: string;
}