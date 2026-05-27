export type DoctorFormFields = {
  fullName: string;
  specialization: string;
  bio: string;
  profilePicture: File | null;
  email: string;
  phone: string;
};

export type Doctor = {
  clerkId: string;
  fullName: string;
  specialization: string;
  bio: string;
  profilePicture: string;
  email: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
};