import { Schema, models, model } from "mongoose";

const PrescriptionSchema = new Schema(
  {
    appointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
      index: true,
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

    diagnosis: {
      type: String,
      default: "",
      trim: true,
    },

    medication: {
      type: String,
      default: "",
      trim: true,
    },

    dosage: {
      type: String,
      default: "",
      trim: true,
    },

    duration: {
      type: String,
      default: "",
      trim: true,
    },

    instructions: {
      type: String,
      default: "",
      trim: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["finalized"],
      default: "finalized",
    },

    isFinalized: {
      type: Boolean,
      default: true,
    },

    issuedAt: {
      type: Date,
      default: null,
    },

    finalizedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const Prescription =
  models.Prescription || model("Prescription", PrescriptionSchema);