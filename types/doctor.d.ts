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
    day: string;
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
  locationLabel: string;
  coords?: LatLngExpression | null;
  fee: number;
  rating: number;
  reviews?: number;
  img: string;
  tags?: string[];
  status?: "accepting" | "fully_booked" | "online";
};