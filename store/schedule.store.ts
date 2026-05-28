// store/schedule-store.ts
import { create } from "zustand";

type WorkingHour = {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

type UnavailableSlot = {
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
};

type ScheduleState = {
  workingHours: WorkingHour[];
  unavailableSlots: UnavailableSlot[];

  setWorkingHours: (data: WorkingHour[]) => void;
  setUnavailableSlots: (data: UnavailableSlot[]) => void;

  addUnavailableSlot: (slot: UnavailableSlot) => void;
  removeUnavailableSlot: (index: number) => void;

  reset: () => void;
};

export const useScheduleStore = create<ScheduleState>((set) => ({
  workingHours: [],
  unavailableSlots: [],

  setWorkingHours: (data) => set({ workingHours: data }),
  setUnavailableSlots: (data) => set({ unavailableSlots: data }),

  addUnavailableSlot: (slot) =>
    set((state) => ({
      unavailableSlots: [...state.unavailableSlots, slot],
    })),

  removeUnavailableSlot: (index) =>
    set((state) => ({
      unavailableSlots: state.unavailableSlots.filter((_, i) => i !== index),
    })),

  reset: () =>
    set({
      workingHours: [],
      unavailableSlots: [],
    }),
}));