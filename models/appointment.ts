import { Schema, models, model } from "mongoose";

const AppointmentSchema = new Schema(
  {
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

    appointmentDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },

    consultationType: {
      type: String,
      enum: ["video", "in_person",],
      required: true,
    },

    consultationSessionLink: {
      type: String,
      default: "",
    },

    reasonForVisit: {
      type: String,
      default: "",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    isSlotLocked: {
      type: Boolean,
      default: true,
    },

    notes: {
      type: String,
      default: "",
    },

    prescription: {
      type: Schema.Types.ObjectId,
      ref: "Prescription",
      default: null,
    },

    medicalRecord: {
      type: Schema.Types.ObjectId,
      ref: "MedicalRecord",
      default: null,
    },

    reminderSent: {
      type: Boolean,
      default: false,
    },

    pushNotificationsSent: {
      booked: {
        type: Boolean,
        default: false,
      },
      upcoming: {
        type: Boolean,
        default: false,
      },
      scheduleUpdate: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

AppointmentSchema.index({ doctor: 1, appointmentDate: 1, startTime: 1 });
AppointmentSchema.index({ patient: 1, appointmentDate: -1 });

export const Appointment =
  models.Appointment || model("Appointment", AppointmentSchema);