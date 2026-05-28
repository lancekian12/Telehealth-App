import { create } from "zustand";
import type {
  DoctorConsultationMode,
  DoctorFormFields,
  WorkingHourInput,
  UnavailableSlotInput,
} from "@/types/doctor";

type DoctorProfile = {
  clerkId: string;
  role: "doctor";
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

const createWorkingHour = (): WorkingHourInput => ({
  day: "Monday",
  startTime: "09:00",
  endTime: "17:00",
  isAvailable: true,
});

const createUnavailableSlot = (): UnavailableSlotInput => ({
  date: "",
  startTime: "",
  endTime: "",
  reason: "Blocked",
});

const initialDoctorForm = (): DoctorFormFields => ({
  role: "doctor",
  fullName: "",
  specialization: "",
  bio: "",
  profilePicture: null,
  email: "",
  phone: "",
  licenseNumber: "",
  experienceYears: "",
  consultationFee: "",
  consultationModes: [],
  languages: "",
  verified: false,
  workingHours: [createWorkingHour()],
  unavailableSlots: [],
  consultationDurationMinutes: "30",

  clinicName: "",
  clinicStreetAddress: "",
  clinicBarangay: "",
  clinicCityMunicipality: "",
  clinicProvince: "",
});

const normalizeProfileToForm = (doctor: DoctorProfile): DoctorFormFields => ({
  role: "doctor",
  fullName: doctor.fullName ?? "",
  specialization: doctor.specialization ?? "",
  bio: doctor.bio ?? "",
  profilePicture: null,
  email: doctor.email ?? "",
  phone: doctor.phone ?? "",
  licenseNumber: doctor.licenseNumber ?? "",
  experienceYears: String(doctor.experienceYears ?? 0),
  consultationFee: String(doctor.consultationFee ?? 0),
  consultationModes: doctor.consultationModes ?? [],
  languages: (doctor.languages ?? []).join(", "),
  verified: doctor.verified ?? false,
  workingHours:
    doctor.workingHours?.length > 0 ? doctor.workingHours : [createWorkingHour()],
  unavailableSlots: doctor.unavailableSlots ?? [],
  consultationDurationMinutes: String(
    doctor.consultationDurationMinutes ?? 30,
  ),

  clinicName: doctor.clinicName ?? "",
  clinicStreetAddress: doctor.clinicStreetAddress ?? "",
  clinicBarangay: doctor.clinicBarangay ?? "",
  clinicCityMunicipality: doctor.clinicCityMunicipality ?? "",
  clinicProvince: doctor.clinicProvince ?? "",
});

type DoctorStore = {
  form: DoctorFormFields;
  loading: boolean;
  submitted: boolean;
  errors: Partial<Record<keyof DoctorFormFields, string>>;
  currentDoctor: DoctorProfile | null;

  setForm: (form: DoctorFormFields) => void;
  resetForm: () => void;
  setLoading: (loading: boolean) => void;
  setSubmitted: (submitted: boolean) => void;
  setErrors: (
    errors:
      | Partial<Record<keyof DoctorFormFields, string>>
      | ((
          prev: Partial<Record<keyof DoctorFormFields, string>>,
        ) => Partial<Record<keyof DoctorFormFields, string>>),
  ) => void;

  setField: <K extends keyof DoctorFormFields>(
    field: K,
    value: DoctorFormFields[K],
  ) => void;

  setEmailFromClerk: (email: string) => void;
  setProfilePicture: (file: File | null) => void;

  toggleConsultationMode: (mode: DoctorConsultationMode) => void;

  addWorkingHour: () => void;
  updateWorkingHour: (
    index: number,
    field: keyof WorkingHourInput,
    value: string | boolean,
  ) => void;
  removeWorkingHour: (index: number) => void;

  addUnavailableSlot: () => void;
  updateUnavailableSlot: (
    index: number,
    field: keyof UnavailableSlotInput,
    value: string,
  ) => void;
  removeUnavailableSlot: (index: number) => void;

  setCurrentDoctor: (doctor: DoctorProfile | null) => void;
  loadCurrentDoctor: () => Promise<void>;
};

export const useDoctorStore = create<DoctorStore>((set, get) => ({
  form: initialDoctorForm(),
  loading: false,
  submitted: false,
  errors: {},
  currentDoctor: null,

  setForm: (form) => set({ form }),

  resetForm: () =>
    set({
      form: initialDoctorForm(),
      loading: false,
      submitted: false,
      errors: {},
      currentDoctor: null,
    }),

  setLoading: (loading) => set({ loading }),
  setSubmitted: (submitted) => set({ submitted }),

  setErrors: (errors) =>
    set((state) => ({
      errors: typeof errors === "function" ? errors(state.errors) : errors,
    })),

  setField: (field, value) =>
    set((state) => ({
      form: {
        ...state.form,
        [field]: value,
      },
      errors: {
        ...state.errors,
        [field]: undefined,
      },
    })),

  setEmailFromClerk: (email) =>
    set((state) => ({
      form: {
        ...state.form,
        email,
      },
    })),

  setProfilePicture: (file) =>
    set((state) => ({
      form: {
        ...state.form,
        profilePicture: file,
      },
      errors: {
        ...state.errors,
        profilePicture: undefined,
      },
    })),

  toggleConsultationMode: (mode) =>
    set((state) => {
      const exists = state.form.consultationModes.includes(mode);

      return {
        form: {
          ...state.form,
          consultationModes: exists
            ? state.form.consultationModes.filter((item) => item !== mode)
            : [...state.form.consultationModes, mode],
        },
        errors: {
          ...state.errors,
          consultationModes: undefined,
        },
      };
    }),

  addWorkingHour: () =>
    set((state) => ({
      form: {
        ...state.form,
        workingHours: [...state.form.workingHours, createWorkingHour()],
      },
    })),

  updateWorkingHour: (index, field, value) =>
    set((state) => ({
      form: {
        ...state.form,
        workingHours: state.form.workingHours.map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot,
        ),
      },
    })),

  removeWorkingHour: (index) =>
    set((state) => ({
      form: {
        ...state.form,
        workingHours: state.form.workingHours.filter((_, i) => i !== index),
      },
    })),

  addUnavailableSlot: () =>
    set((state) => ({
      form: {
        ...state.form,
        unavailableSlots: [
          ...state.form.unavailableSlots,
          createUnavailableSlot(),
        ],
      },
    })),

  updateUnavailableSlot: (index, field, value) =>
    set((state) => ({
      form: {
        ...state.form,
        unavailableSlots: state.form.unavailableSlots.map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot,
        ),
      },
    })),

  removeUnavailableSlot: (index) =>
    set((state) => ({
      form: {
        ...state.form,
        unavailableSlots: state.form.unavailableSlots.filter(
          (_, i) => i !== index,
        ),
      },
    })),

  setCurrentDoctor: (doctor) =>
    set({
      currentDoctor: doctor,
      form: doctor ? normalizeProfileToForm(doctor) : initialDoctorForm(),
    }),

  loadCurrentDoctor: async () => {
    try {
      set({ loading: true });

      const res = await fetch("/api/doctor");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load doctor profile");
      }

      const doctor = Array.isArray(data.doctor) ? data.doctor[0] : null;

      set({
        currentDoctor: doctor,
        form: doctor ? normalizeProfileToForm(doctor) : initialDoctorForm(),
      });
    } catch (error) {
      console.error("loadCurrentDoctor error:", error);
    } finally {
      set({ loading: false });
    }
  },
}));