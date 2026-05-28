import { Schema, models, model } from "mongoose";

const MedicalRecordSchema = new Schema(
  {
    appointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },

    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    chiefComplaint: {
      type: String,
      default: "",
    },

    findings: {
      type: String,
      default: "",
    },

    diagnosis: {
      type: String,
      default: "",
    },

    recommendations: {
      type: String,
      default: "",
    },

    consultationSummary: {
      type: String,
      default: "",
    },

    followUpInstructions: {
      type: String,
      default: "",
    },

    attachments: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const MedicalRecord =
  models.MedicalRecord || model("MedicalRecord", MedicalRecordSchema);