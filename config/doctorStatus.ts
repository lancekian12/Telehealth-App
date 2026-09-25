export type DoctorApplicationStatus = "pending" | "accepted" | "rejected";

/**
 * Doctors created before the application-review feature existed have no
 * applicationStatus field on disk yet, so this falls back to their existing
 * `verified` flag rather than misclassifying them as pending.
 */
export function resolveDoctorApplicationStatus(doctor: {
  applicationStatus?: string;
  verified?: boolean;
}): DoctorApplicationStatus {
  if (
    doctor.applicationStatus === "accepted" ||
    doctor.applicationStatus === "rejected" ||
    doctor.applicationStatus === "pending"
  ) {
    return doctor.applicationStatus;
  }
  return doctor.verified ? "accepted" : "pending";
}

export function isDoctorAccepted(doctor: {
  applicationStatus?: string;
  verified?: boolean;
}) {
  return resolveDoctorApplicationStatus(doctor) === "accepted";
}

/** Mongo query fragment matching only doctors visible to patients. */
export const ACCEPTED_DOCTOR_QUERY = {
  $or: [
    { applicationStatus: "accepted" },
    { applicationStatus: { $exists: false }, verified: true },
  ],
};
