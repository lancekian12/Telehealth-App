import { create } from "zustand";
import { Patient } from "@/types/patient";
import { Doctor } from "@/types/doctor";

interface AuthStore {
  patient: Patient | null;
  doctor: Doctor | null;

  loading: boolean;
  isAuthenticated: boolean;

  setPatient: (patient: Patient | null) => void;
  setDoctor: (doctor: Doctor | null) => void;

  clearPatient: () => void;
  clearDoctor: () => void;
  clearAuth: () => void;

  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  patient: null,
  doctor: null,
  loading: false,
  isAuthenticated: false,

  setPatient: (patient) =>
    set({
      patient,
      isAuthenticated: !!patient,
      doctor: null,
    }),

  setDoctor: (doctor) =>
    set({
      doctor,
      isAuthenticated: !!doctor,
      patient: null,
    }),

  clearPatient: () =>
    set({
      patient: null,
      isAuthenticated: false,
    }),

  clearDoctor: () =>
    set({
      doctor: null,
      isAuthenticated: false,
    }),

  clearAuth: () =>
    set({
      patient: null,
      doctor: null,
      isAuthenticated: false,
    }),

  setLoading: (loading) =>
    set({
      loading,
    }),
}));