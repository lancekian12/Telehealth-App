import { create } from "zustand";
import { Patient } from "@/types/patient";

interface AuthStore {
  patient: Patient | null;

  loading: boolean;

  isAuthenticated: boolean;

  setPatient: (patient: Patient) => void;

  clearPatient: () => void;

  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  patient: null,

  loading: false,

  isAuthenticated: false,

  setPatient: (patient) =>
    set({
      patient,
      isAuthenticated: true,
    }),

  clearPatient: () =>
    set({
      patient: null,
      isAuthenticated: false,
    }),

  setLoading: (loading) =>
    set({
      loading,
    }),
}));