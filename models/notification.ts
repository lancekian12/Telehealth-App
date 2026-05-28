import { Schema, models, model } from "mongoose";

const NotificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      refPath: "userModel",
      required: true,
    },

    userModel: {
      type: String,
      required: true,
      enum: ["Doctor", "Patient"],
    },

    type: {
      type: String,
      enum: [
        "appointment_booked",
        "appointment_accepted",
        "appointment_rejected",
        "appointment_upcoming",
        "schedule_updated",
        "prescription_created",
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

    appointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ user: 1, read: 1 });

export const Notification =
  models.Notification || model("Notification", NotificationSchema);