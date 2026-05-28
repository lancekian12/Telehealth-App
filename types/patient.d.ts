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

export type FilterModalProps = {
  open: boolean;
  onClose: () => void;

  specialty: string;
  setSpecialty: (value: string) => void;
  specialties: string[];

  minRating: number;
  setMinRating: (value: number) => void;

  minPrice: number | "";
  setMinPrice: (value: number | "") => void;

  maxPrice: number | "";
  setMaxPrice: (value: number | "") => void;

  consultationMode: "all" | "video" | "in_person";
  setConsultationMode: (value: "all" | "video" | "in_person") => void;

  language: string;
  setLanguage: (value: string) => void;
  languages: string[];

  verifiedOnly: boolean;
  setVerifiedOnly: (value: boolean) => void;

  acceptingOnly: boolean;
  setAcceptingOnly: (value: boolean) => void;

  onApply: () => void;
  onReset: () => void;
};