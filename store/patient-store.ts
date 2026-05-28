import { create } from "zustand";
import type { FormFields } from "@/types/patient";

const initialPatientForm = (): FormFields => ({
  role: "patient",
  fullName: "",
  birthday: "",
  weight: "",
  height: "",
  profilePicture: null,
  email: "",
  phone: "",
  basicMedicalHistory: "",
});

type PatientStore = {
  form: FormFields;
  loading: boolean;
  submitted: boolean;
  errors: Partial<Record<keyof FormFields, string>>;

  setForm: (form: FormFields) => void;
  resetForm: () => void;
  setLoading: (loading: boolean) => void;
  setSubmitted: (submitted: boolean) => void;
  setErrors: (
    errors:
      | Partial<Record<keyof FormFields, string>>
      | ((prev: Partial<Record<keyof FormFields, string>>) => Partial<Record<keyof FormFields, string>>)
  ) => void;

  setField: <K extends keyof FormFields>(field: K, value: FormFields[K]) => void;

  setEmailFromClerk: (email: string) => void;
  setProfilePicture: (file: File | null) => void;
};

export const usePatientStore = create<PatientStore>((set) => ({
  form: initialPatientForm(),
  loading: false,
  submitted: false,
  errors: {},

  setForm: (form) => set({ form }),

  resetForm: () =>
    set({
      form: initialPatientForm(),
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
}));