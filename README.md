# Telehealth App

A simple telehealth platform for patients and doctors.

Patients can find doctors, book consultations, join online sessions, and view medical records. Doctors can manage schedules, handle appointments, write prescriptions, and maintain consultation records.

## Features

### Patient
- Create and manage account
- Complete personal profile
- Browse and search doctors
- Filter doctors by specialization
- Receive AI-powered doctor recommendations
- Book, reschedule, or cancel appointments
- Join virtual consultations
- View appointment history
- Access medical records and prescriptions
- Receive real-time notifications

### Doctor
- Create and manage account
- Add profile details and specialization
- Manage schedules and availability
- Restrict unavailable time slots
- View patient records
- Handle appointments
- Join consultation sessions
- Create prescriptions and consultation notes
- Receive real-time notifications

## Tech Stack

- Next.js
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

### Patient
- `/`
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
- `/doctor/notifications`

## API Routes

- `/api/ai-recommendation`
- `/api/appointments`
- `/api/doctor`
- `/api/doctors`
- `/api/notifications`
- `/api/patient`
- `/api/pusher/auth`
- `/api/stream-token`

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

The project aims to provide an accessible telehealth platform that connects patients with healthcare professionals through online consultations, appointment management, AI-assisted doctor recommendations, and digital medical records.