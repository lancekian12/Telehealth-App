export type UserRole = "patient" | "doctor";

export type FormFields = {
  role: UserRole;

  fullName: string;
  birthday: string;
  weight: string;
  height: string;
  profilePicture: File | null;
  email: string;
  phone: string;
  basicMedicalHistory: string;
};

export interface Patient {
  _id?: string;

  clerkId: string;

  role: UserRole;

  fullName: string;

  birthday: string;

  weight: string;

  height: string;

  profilePicture?: string;

  email: string;

  phone: string;

  basicMedicalHistory: string;

  createdAt?: string;
  updatedAt?: string;
}