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
    | (Person & {
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
