import { Schema, models, model } from "mongoose";

const PatientSchema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["patient", "doctor"],
      default: "patient",
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    birthday: {
      type: Date,
      required: true,
    },

    weight: {
      type: String,
      required: true,
    },

    height: {
      type: String,
      required: true,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    basicMedicalHistory: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Patient = models.Patient || model("Patient", PatientSchema);
