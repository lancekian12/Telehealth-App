import { create } from "zustand";
import type {
  DoctorConsultationMode,
  DoctorFormFields,
  WorkingHourInput,
  UnavailableSlotInput,
} from "@/types/doctor";

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
  clinicAddress: "",
});

type DoctorStore = {
  form: DoctorFormFields;
  loading: boolean;
  submitted: boolean;
  errors: Partial<Record<keyof DoctorFormFields, string>>;

  setForm: (form: DoctorFormFields) => void;
  resetForm: () => void;
  setLoading: (loading: boolean) => void;
  setSubmitted: (submitted: boolean) => void;
  setErrors: (
    errors:
      | Partial<Record<keyof DoctorFormFields, string>>
      | ((
          prev: Partial<Record<keyof DoctorFormFields, string>>
        ) => Partial<Record<keyof DoctorFormFields, string>>)
  ) => void;

  setField: <K extends keyof DoctorFormFields>(
    field: K,
    value: DoctorFormFields[K]
  ) => void;

  setEmailFromClerk: (email: string) => void;
  setProfilePicture: (file: File | null) => void;

  toggleConsultationMode: (mode: DoctorConsultationMode) => void;

  addWorkingHour: () => void;
  updateWorkingHour: (
    index: number,
    field: keyof WorkingHourInput,
    value: string | boolean
  ) => void;
  removeWorkingHour: (index: number) => void;

  addUnavailableSlot: () => void;
  updateUnavailableSlot: (
    index: number,
    field: keyof UnavailableSlotInput,
    value: string
  ) => void;
  removeUnavailableSlot: (index: number) => void;
};

export const useDoctorStore = create<DoctorStore>((set) => ({
  form: initialDoctorForm(),
  loading: false,
  submitted: false,
  errors: {},

  setForm: (form) => set({ form }),

  resetForm: () =>
    set({
      form: initialDoctorForm(),
      loading: false,
      submitted: false,
      errors: {},
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
          i === index ? { ...slot, [field]: value } : slot
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
          i === index ? { ...slot, [field]: value } : slot
        ),
      },
    })),

  removeUnavailableSlot: (index) =>
    set((state) => ({
      form: {
        ...state.form,
        unavailableSlots: state.form.unavailableSlots.filter(
          (_, i) => i !== index
        ),
      },
    })),
}));