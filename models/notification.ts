import { Schema, models, model } from "mongoose";

const NotificationSchema = new Schema(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    recipientModel: {
      type: String,
      enum: ["Patient", "Doctor"],
      required: true,
    },
    recipientRole: {
      type: String,
      enum: ["patient", "doctor"],
      required: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    type: {
      type: String,
      enum: [
        "appointment_booked",
        "appointment_accepted",
        "appointment_rejected",
        "appointment_cancelled",
        "appointment_rescheduled",
        "appointment_upcoming",
        "schedule_updated",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

NotificationSchema.index({ recipientId: 1, createdAt: -1 });
NotificationSchema.index({ appointmentId: 1 });

export const Notification =
  models.Notification || model("Notification", NotificationSchema);