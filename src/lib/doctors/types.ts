export const DOCTOR_SPECIALTIES = ['General Medicine', 'Cardiology', 'Dermatology', 'Dentistry', 'ENT', 'Gynecology', 'Mental Health', 'Orthopedics', 'Pediatrics', 'Other'] as const;
export const CONSULTATION_MODES = ['chat', 'video', 'phone'] as const;
export type ConsultationMode = typeof CONSULTATION_MODES[number];
export type ConsultationStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled';

export interface Doctor {
  id: string;
  name: string;
  degrees: string;
  specialty: string;
  experienceYears: number;
  city: string;
  country: string;
  languages: string;
  about: string;
  modes: ConsultationMode[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DoctorDraft = Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>;

export interface ConsultationRequest {
  id: string;
  userId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  patientName: string;
  age: number;
  phone: string;
  email: string;
  city: string;
  concern: string;
  mode: ConsultationMode;
  preferredDate: string;
  preferredTime: string;
  status: ConsultationStatus;
  scheduledAt: string;
  contactMethod: 'whatsapp' | 'meet' | 'zoom' | 'phone' | '';
  contactValue: string;
  adminMessage: string;
  createdAt: string;
  updatedAt: string;
}

export type ConsultationDraft = Pick<ConsultationRequest, 'patientName' | 'age' | 'phone' | 'email' | 'city' | 'concern' | 'mode' | 'preferredDate' | 'preferredTime'>;
