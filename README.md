# Telehealth App

A simple telehealth platform for patients, doctors, and admins.

Patients can find doctors, book consultations, join online sessions, and view medical records. Doctors can manage schedules, handle appointments, write prescriptions, and maintain consultation records. Admins review doctor applications, oversee appointments, and manage patient records from a separate admin console.

## Features

### Patient
- Create and manage account
- Complete personal profile, including a profile picture
- Change password
- Browse and search doctors, filter by specialization
- Receive AI-powered doctor recommendations
- Book, reschedule, or cancel appointments
- Join virtual consultations
- Confirm ending a consultation when leaving a video call
- Track appointment status end-to-end: Pending → Accepted → Ongoing → Completed → Prescription Pending, or Cancelled / Unattended
- See why an appointment was cancelled or marked unattended, with a step-by-step timeline
- View appointment history with status filters
- Access medical records and prescriptions
- Receive real-time notifications

### Doctor
- Create and manage account
- Add profile details and specialization
- Change password
- Manage schedules and availability
- Restrict unavailable time slots and expired time slots for the current day
- View patient records
- Handle appointments: accept, reject, reschedule requests, and view the same status/tracker system as patients
- Join consultation sessions
- Provide prescriptions once a consultation is completed
- Receive real-time notifications
- Blocked from logging in while their application is Pending or Rejected

### Admin
- Independent admin login, separate from Clerk
- Dashboard with real-time stats, appointment trends, and top specialties
- Review, approve, reject, and reconsider doctor applications
- Revoke an already-approved doctor's status
- View and search patient records
- Appointments board (kanban-style), grouped by status, including Cancelled/Unattended
- Change admin password
- Route-level protection for all `/admin` pages and `/api/admin` routes

### Appointment status system
- Statuses: `pending`, `accepted`, `rejected`, `completed`, `cancelled`, `unattended`
- `ongoing` and `prescription pending` are derived, not stored — computed from the scheduled time window and whether a prescription exists
- A lazy sweep (`config/appointmentSweep.ts`) automatically marks past pending/accepted appointments as `unattended` whenever appointments are fetched, so no background job is required
- Cancellation and unattended reasons, plus timestamps, are recorded and shown to both patient and doctor

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- MongoDB
- Mongoose
- Clerk Authentication
- Pusher
- Stream Video
- Google GenAI
- Cloudinary
- Leaflet

## Main Pages

### Public / Auth
- `/`
- `/login`
- `/signup`
- `/patientsignup`
- `/patientsignup/patientsignupdetails`
- `/doctorsignup`
- `/doctorsignup/doctorsignupdetails`
- `/doctorsignup/post-signup`
- `/post-login`
- `/account-status`
- `/privacy-policy`
- `/terms`
- `/cookies`

### Patient
- `/finddoctor`
- `/bookappointment`
- `/appointments`
- `/medicalrecord`
- `/prescription`
- `/consultation/[appointmentId]`

### Doctor
- `/doctor/home`
- `/doctor/appointments`
- `/doctor/schedule`
- `/doctor/patientrecords`
- `/doctor/prescription`
- `/doctor/settings`
- `/doctor/notifications`

### Admin
- `/admin/login`
- `/admin/dashboard`
- `/admin/applications`
- `/admin/appointments`
- `/admin/patients`
- `/admin/settings`

## API Routes

### Core
- `/api/ai-recommendation`
- `/api/appointments`
- `/api/appointments/[id]/accept`
- `/api/appointments/[id]/prescription`
- `/api/doctor`
- `/api/doctor/[id]`
- `/api/doctor/schedule-settings`
- `/api/doctor/schedule-overrides`
- `/api/doctor/unavailable`
- `/api/doctor/working-hours`
- `/api/doctors`
- `/api/notifications`
- `/api/patient`
- `/api/pusher/auth`
- `/api/send-email`
- `/api/stream-token`

### Admin
- `/api/admin/auth/login`
- `/api/admin/auth/logout`
- `/api/admin/auth/me`
- `/api/admin/auth/change-password`
- `/api/admin/dashboard/stats`
- `/api/admin/dashboard/appointments`
- `/api/admin/dashboard/specialties`
- `/api/admin/doctors/verification-stats`
- `/api/admin/applications`
- `/api/admin/applications/[id]`
- `/api/admin/applications/[id]/approve`
- `/api/admin/applications/[id]/reject`
- `/api/admin/appointments`
- `/api/admin/patients`
- `/api/admin/patients/[id]`
- `/api/admin/patients/recent`
- `/api/admin/notifications`
- `/api/admin/notifications/[id]/read`
- `/api/admin/notifications/read-all`
- `/api/admin/search`

## Installation

Clone the repository:

```bash
git clone https://github.com/lancekian12/Telehealth-App.git
```

Navigate to the project directory:

```bash
cd Telehealth-App
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file and configure the required environment variables.

Start the development server:

```bash
npm run dev
```

Open your browser and visit:

```text
http://localhost:3000
```

## Production Build

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Project Goal

The project aims to provide an accessible telehealth platform that connects patients with healthcare professionals through online consultations, appointment management, AI-assisted doctor recommendations, and digital medical records, backed by an admin console for oversight and doctor verification.
