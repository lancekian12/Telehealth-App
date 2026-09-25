export type StatTrend = "up" | "down" | "stable";

export type DashboardStat = {
  total: number;
  changePercent: number;
  trend: StatTrend;
};

export type DashboardStatsResponse = {
  success: boolean;
  message?: string;
  stats?: {
    totalUsers: DashboardStat;
    totalPatients: DashboardStat;
    totalDoctors: DashboardStat;
    totalAppointments: DashboardStat;
  };
};

export type WeeklyTrendPoint = {
  day: string;
  consultations: number;
  followUps: number;
};

export type AppointmentsOverviewResponse = {
  success: boolean;
  message?: string;
  range?: string;
  summary?: {
    pending: number;
    completed: number;
    today: number;
    upcoming: number;
  };
  weeklyTrend?: WeeklyTrendPoint[];
};

export type SpecialtyStat = {
  specialty: string;
  count: number;
  percentage: number;
};

export type SpecialtiesResponse = {
  success: boolean;
  message?: string;
  specialties?: SpecialtyStat[];
  total?: number;
};

export type RecentPatientRow = {
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  doctorName: string;
  condition?: string;
  status: string;
  date: string;
};

export type RecentPatientsResponse = {
  success: boolean;
  message?: string;
  patients?: RecentPatientRow[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type VerificationStatsResponse = {
  success: boolean;
  message?: string;
  stats?: {
    pending: number;
    accepted: number;
    rejected: number;
    total: number;
  };
};

export type AdminNotification = {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

export type AdminNotificationsResponse = {
  success: boolean;
  message?: string;
  notifications?: AdminNotification[];
};

export type SearchResults = {
  patients: { id: string; name: string; email: string; avatar: string }[];
  doctors: {
    id: string;
    name: string;
    email: string;
    specialization: string;
    avatar: string;
    status: string;
  }[];
  appointments: {
    id: string;
    patientName: string;
    doctorName: string;
    date: string;
    status: string;
  }[];
  applications: {
    id: string;
    name: string;
    specialization: string;
    avatar: string;
    submittedAt: string;
  }[];
};

export type SearchResponse = {
  success: boolean;
  message?: string;
  query?: string;
  results?: SearchResults;
};

export type DoctorApplication = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  specialization: string;
  bio?: string;
  avatar?: string;
  licenseNumber?: string;
  experienceYears?: number;
  consultationFee?: number;
  clinicName?: string;
  clinicAddress?: string;
  languages?: string[];
  status: "pending" | "accepted" | "rejected";
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt: string | null;
};

export type ApplicationsListResponse = {
  success: boolean;
  message?: string;
  applications?: DoctorApplication[];
};

export type ApplicationDetailResponse = {
  success: boolean;
  message?: string;
  application?: DoctorApplication;
};

export type PatientListRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profilePicture?: string;
  birthday?: string;
  appointmentCount: number;
  joinedAt: string;
};

export type PatientsListResponse = {
  success: boolean;
  message?: string;
  patients?: PatientListRow[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type PatientAppointmentRow = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  consultationType: string;
  condition: string;
  doctorName: string;
  doctorSpecialization: string;
};

export type PatientDetail = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profilePicture?: string;
  birthday?: string;
  weight?: string;
  height?: string;
  basicMedicalHistory?: string;
  joinedAt: string;
};

export type PatientDetailResponse = {
  success: boolean;
  message?: string;
  patient?: PatientDetail;
  appointments?: PatientAppointmentRow[];
};

export type AppointmentColumnKey =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type AppointmentBoardCard = {
  id: string;
  shortId: string;
  patientName: string;
  patientAvatar?: string;
  doctorName: string;
  doctorSpecialization: string;
  consultationType: "video" | "in_person";
  status: string;
  column: AppointmentColumnKey;
  startTime: string;
  endTime: string;
  appointmentDate: string;
  reasonForVisit: string;
};

export type AppointmentBoardResponse = {
  success: boolean;
  message?: string;
  date?: string;
  columns?: Record<AppointmentColumnKey, AppointmentBoardCard[]>;
  total?: number;
};
