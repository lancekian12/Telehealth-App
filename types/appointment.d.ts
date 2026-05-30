export type AppointmentItem = {
  _id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  consultationType: ConsultationType;
  consultationType: "video" | "in_person";
  consultationSessionLink?: string;
  consultationSessionId?: string;
  cancellationReason?: string;
  reasonForVisit?: string;
  rejectionReason?: string;
  rescheduleReason?: string;
  notes?: string;
  consultationSessionLink?: string;
  doctor:
    | string
    | ({
        _id: string;
      } & Person & {
          specialization?: string;
          clinicAddress?: string;
        });
  patient?:
    | string
    | (Person & {
        profilePicture?: string;
      });
};

export type AppointmentStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";

export type ConsultationType = "video" | "in_person";

export type Person = {
  fullName?: string;
  email?: string;
  profilePicture?: string;
  phone?: string;
  birthday?: string;
  height?: string | number;
  weight?: string | number;
  basicMedicalHistory?: string;
};

export type DoctorWorkingHour = {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
};

export type DoctorApiItem = {
  id: string;
  workingHours?: DoctorWorkingHour[];
};

export type AppointmentApiResponse =
  | {
      success: true;
      appointments: AppointmentItem[];
    }
  | {
      success: false;
      message?: string;
  };
    

export type ConsultationType = "video" | "in_person";

export type WorkingHour = {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
};

export type ScheduleOverride = {
  date: string;
  action: "rescheduled" | "cancelled";
  startTime?: string | null;
  endTime?: string | null;
  newDate?: string | null;
  newStartTime?: string | null;
  newEndTime?: string | null;
  reason?: string;
};

export type UnavailableSlot = {
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  allDay?: boolean;
  reason?: string;
};

export type DoctorDetailsResponse = {
  success: boolean;
  message?: string;
  doctor?: {
    id: string;
    fullName: string;
    specialization: string;
    profilePicture?: string;
    consultationFee?: number;
    clinicAddress?: string;
    rating?: number;
    consultationDurationMinutes?: number;
    workingHours?: WorkingHour[];
    unavailableSlots?: UnavailableSlot[];
    scheduleOverrides?: ScheduleOverride[];
    bookedSlots?: Array<{
      date: string;
      startTime: string;
      endTime: string;
    }>;
  };
};

export type PatientMeResponse = {
  success: boolean;
  message?: string;
  patient?: {
    id: string;
    clerkId: string;
    role: string;
    fullName: string;
    profilePicture?: string;
    email?: string;
  };
};

export type TimeSlot = {
  startTime: string;
  endTime: string;
  label: string;
};

export type TimeRange = {
  startTime: string;
  endTime: string;
};
