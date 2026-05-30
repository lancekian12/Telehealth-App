export type Prescription = {
  diagnosis?: string;
  medication?: string;
  dosage?: string;
  duration?: string;
  instructions?: string;
  notes?: string;
  status?: string;
  isFinalized?: boolean;
};

export type Patient = {
  _id?: string;
  fullName?: string;
  email?: string;
  profilePicture?: string;
  phone?: string;
  birthday?: string;
  height?: string;
  weight?: string;
  basicMedicalHistory?: string;
};

export type Doctor = {
  _id?: string;
  fullName?: string;
  specialization?: string;
  clinicAddress?: string;
  profilePicture?: string;
  licenseNumber?: string;
};

export type Appointment = {
  _id: string;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  consultationType?: "video" | "in_person";
  reasonForVisit?: string;
  notes?: string;
  doctor?: Doctor | string;
  patient?: Patient | string;
  prescription?: Prescription | null;
};

export type PatientResponse =
  | { success: true; patient: Patient }
  | { success: false; message?: string };

export type AppointmentsResponse =
  | { success: true; appointments: Appointment[] }
  | { success: false; message?: string };