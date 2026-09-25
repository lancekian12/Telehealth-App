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
