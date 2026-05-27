export type FormFields = {
  
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