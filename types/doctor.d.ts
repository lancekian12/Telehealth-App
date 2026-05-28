export type DoctorConsultationMode = "video" | "in_person";

export type WorkingHourInput = {
  date: string;
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

export type DoctorScheduleOverride = {
  date: string;
  status?: "available" | "blocked";
  action?: "rescheduled" | "cancelled";
  startTime?: string | null;
  endTime?: string | null;
  newDate?: string | null;
  newStartTime?: string | null;
  newEndTime?: string | null;
  reason?: string;
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

  clinicName: string;
  clinicStreetAddress: string;
  clinicBarangay: string;
  clinicCityMunicipality: string;
  clinicProvince: string;
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

  clinicName: string;
  clinicStreetAddress: string;
  clinicBarangay: string;
  clinicCityMunicipality: string;
  clinicProvince: string;
  clinicAddress: string;

  latitude?: number | null;
  longitude?: number | null;

  pushNotificationToken: string;

  createdAt?: string;
  updatedAt?: string;
};

export type DoctorApiItem = {
  id: string;
  fullName: string;
  specialization: string;
  bio: string;
  profilePicture: string;
  email: string;
  phone: string;
  rating: number;
  consultationFee: number;
  consultationModes: string[];
  languages: string[];
  verified: boolean;
  acceptsNewPatients: boolean;
  workingHours: Array<{
    date: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
  unavailableSlots: Array<{
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
  }>;
  scheduleOverrides?: Array<{
    date: string;
    status?: "available" | "blocked";
    action?: "rescheduled" | "cancelled";
    startTime?: string | null;
    endTime?: string | null;
    newDate?: string | null;
    newStartTime?: string | null;
    newEndTime?: string | null;
    reason?: string;
  }>;
  consultationDurationMinutes: number;

  clinicName: string;
  clinicStreetAddress: string;
  clinicBarangay: string;
  clinicCityMunicipality: string;
  clinicProvince: string;
  clinicAddress: string;

  latitude?: number | null;
  longitude?: number | null;
};

export type FindDoctor = {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  clinicAddress: string;
  locationLabel: string;
  coords: [number, number] | null;
  fee: number;
  rating: number;
  reviews: number;
  img: string;
  tags: string[];
  status: "accepting" | "fully_booked";

  bio?: string;
  verified?: boolean;
  acceptsNewPatients?: boolean;
  consultationModes?: Array<"video" | "in_person">;
  languages?: string[];
};

export type WorkingHour = {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

export type UnavailableSlot = {
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
};

export type ScheduleOverride = {
  date: string;
  status?: "available" | "blocked";
  action?: "rescheduled" | "cancelled";
  startTime?: string | null;
  endTime?: string | null;
  newDate?: string | null;
  newStartTime?: string | null;
  newEndTime?: string | null;
  reason?: string;
};

export type AppointmentType = "online" | "clinic";

export type AppointmentRecord = {
  id: string;
  patientName: string;
  patientAvatar?: string;
  date: string;
  time: string;
  type: AppointmentType;
  reason?: string;
  status?: "pending" | "confirmed" | "completed" | "cancelled";
};

export type DoctorResponse = {
  success: boolean;
  message?: string;
  doctor?: {
    workingHours?: {
      date: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }[];
    unavailableSlots?: UnavailableSlot[];
    scheduleOverrides?: ScheduleOverride[];
    appointments?: unknown;
    bookings?: unknown;
    scheduledPatients?: unknown;
    consultationDurationMinutes?: number;
  };
};

export type ScheduleResponse = {
  scheduleOverrides?: {
    date: string;
    status?: "available" | "blocked";
    action?: "rescheduled" | "cancelled";
    startTime?: string | null;
    endTime?: string | null;
    newDate?: string | null;
    newStartTime?: string | null;
    newEndTime?: string | null;
    reason?: string;
  }[];
  success: boolean;
  message?: string;
  workingHours?: WorkingHour[];
  unavailableSlots?: UnavailableSlot[];
};

export type AppointmentEventProps = {
  type: AppointmentType;
  description?: string;
  patientName?: string;
  status?: string;
};