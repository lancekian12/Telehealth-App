export type DoctorConsultationMode = "video" | "in_person";

export type WorkingHourInput = {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

export type UnavailableSlotInput = {
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
};

export type DoctorFormFields = {
  role: UserRole;

  fullName: string;
  specialization: string;
  bio: string;
  profilePicture: File | null;
  email: string;
  phone: string;

  licenseNumber: string;
  experienceYears: string;
  consultationFee: string;

  consultationModes: DoctorConsultationMode[];
  languages: string;

  verified: boolean;
  workingHours: WorkingHourInput[];
  unavailableSlots: UnavailableSlotInput[];

  consultationDurationMinutes: string;
  clinicAddress: string;
};

export type Doctor = {
  role: UserRole;
  clerkId: string;
  fullName: string;
  specialization: string;
  bio: string;
  profilePicture: string;
  email: string;
  phone: string;

  licenseNumber: string;
  experienceYears: number;
  rating: number;
  consultationFee: number;
  consultationModes: DoctorConsultationMode[];
  languages: string[];
  verified: boolean;
  acceptsNewPatients: boolean;
  workingHours: WorkingHourInput[];
  unavailableSlots: UnavailableSlotInput[];
  consultationDurationMinutes: number;
  clinicAddress: string;
  pushNotificationToken: string;

  createdAt?: string;
  updatedAt?: string;
};