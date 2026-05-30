// config/consultation.ts
export function buildConsultationSessionId(appointmentId: string) {
  return `consultation-${appointmentId}`;
}

export function buildConsultationLink(appointmentId: string) {
  return `/consultation/${appointmentId}`;
}