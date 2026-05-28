import { Schema, models, model } from "mongoose";

const PrescriptionItemSchema = new Schema(
  {
    medicineName: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      type: String,
      required: true,
      trim: true,
    },
    frequency: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    instructions: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const PrescriptionSchema = new Schema(
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

    items: {
      type: [PrescriptionItemSchema],
      default: [],
    },

    notes: {
      type: String,
      default: "",
    },

    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Prescription =
  models.Prescription || model("Prescription", PrescriptionSchema);