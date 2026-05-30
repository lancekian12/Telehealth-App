import { Types } from "mongoose";
import { Notification } from "@/models/notification";
import {
  pusher,
  getUserChannel,
  notificationEvent,
} from "@/config/notification";

type Role = "patient" | "doctor";

type AppointmentLike = {
  _id: string | Types.ObjectId;
  doctor: { _id: string | Types.ObjectId; fullName?: string };
  patient: { _id: string | Types.ObjectId; fullName?: string };
  appointmentDate?: string | Date;
  startTime?: string;
  endTime?: string;
  status?: string;
  consultationType?: string;
};

type NotifyParams = {
  recipientRole: Role;
  recipientModel: "Patient" | "Doctor";
  recipientId: string | Types.ObjectId;
  appointmentId?: string | Types.ObjectId | null;
  type:
    | "appointment_booked"
    | "appointment_accepted"
    | "appointment_rejected"
    | "appointment_cancelled"
    | "appointment_rescheduled"
    | "appointment_upcoming"
    | "schedule_updated"
    | "appointment_completed"; // add this
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
};
export async function createNotification(params: NotifyParams) {
  const doc = await Notification.create({
    recipientId: params.recipientId,
    recipientModel: params.recipientModel,
    recipientRole: params.recipientRole,
    appointmentId: params.appointmentId ?? null,
    type: params.type,
    title: params.title,
    message: params.message,
    metadata: params.metadata ?? {},
    read: false,
  });

  const channel = getUserChannel(
    params.recipientRole,
    String(params.recipientId),
  );

  await pusher.trigger(channel, notificationEvent, {
    id: String(doc._id),
    recipientId: String(params.recipientId),
    recipientRole: params.recipientRole,
    appointmentId: params.appointmentId ? String(params.appointmentId) : null,
    type: params.type,
    title: params.title,
    message: params.message,
    metadata: params.metadata ?? {},
    createdAt: doc.createdAt,
  });

  return doc;
}

export async function notifyBothAppointmentSides(args: {
  appointment: AppointmentLike;
  type:
    | "appointment_booked"
    | "appointment_accepted"
    | "appointment_rejected"
    | "appointment_cancelled"
    | "appointment_rescheduled"
    | "appointment_upcoming"
    | "appointment_completed"
    | "schedule_updated";

  patientTitle: string;
  patientMessage: string;
  doctorTitle: string;
  doctorMessage: string;
  metadata?: Record<string, unknown>;
}) {
  const appointmentId = args.appointment._id;

  const [patientNotification, doctorNotification] = await Promise.all([
    createNotification({
      recipientRole: "patient",
      recipientModel: "Patient",
      recipientId: args.appointment.patient._id,
      appointmentId,
      type: args.type,
      title: args.patientTitle,
      message: args.patientMessage,
      metadata: args.metadata,
    }),
    createNotification({
      recipientRole: "doctor",
      recipientModel: "Doctor",
      recipientId: args.appointment.doctor._id,
      appointmentId,
      type: args.type,
      title: args.doctorTitle,
      message: args.doctorMessage,
      metadata: args.metadata,
    }),
  ]);

  return { patientNotification, doctorNotification };
}
