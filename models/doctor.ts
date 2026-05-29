import { Schema, models, model } from "mongoose";

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function isOneHourSlot(startTime: string, endTime: string) {
  return timeToMinutes(endTime) - timeToMinutes(startTime) === 60;
}

const WorkingHourSchema = new Schema(
  {
    date: {
      type: String,
      required: true, // YYYY-MM-DD
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: function (this: { startTime?: string }, value: string) {
          if (!this.startTime) return true;
          return isOneHourSlot(this.startTime, value);
        },
        message: "Each working hour slot must be exactly 1 hour",
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const UnavailableSlotSchema = new Schema(
  {
    date: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const ScheduleOverrideSchema = new Schema(
  {
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      default: null,
    },
    endTime: {
      type: String,
      default: null,
    },
    action: {
      type: String,
      enum: ["rescheduled", "cancelled"],
      required: true,
    },
    newDate: {
      type: String,
      default: null,
    },
    newStartTime: {
      type: String,
      default: null,
    },
    newEndTime: {
      type: String,
      default: null,
    },
    reason: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

const DoctorSchema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },

    workingHours: {
      type: [WorkingHourSchema],
      default: [],
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    specialization: {
      type: String,
      required: true,
      trim: true,
    },

    bio: {
      type: String,
      required: true,
      trim: true,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    licenseNumber: {
      type: String,
      default: "",
    },

    experienceYears: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      default: 0,
    },

    consultationFee: {
      type: Number,
      default: 0,
    },

    consultationModes: [
      {
        type: String,
        enum: ["video", "in_person"],
      },
    ],

    languages: [
      {
        type: String,
        trim: true,
      },
    ],

    verified: {
      type: Boolean,
      default: false,
    },

    acceptsNewPatients: {
      type: Boolean,
      default: true,
    },

    unavailableSlots: {
      type: [UnavailableSlotSchema],
      default: [],
    },

    scheduleOverrides: {
      type: [ScheduleOverrideSchema],
      default: [],
    },

    role: {
      type: String,
      enum: ["patient", "doctor"],
      default: "doctor",
    },

    consultationDurationMinutes: {
      type: Number,
      default: 60,
    },

    clinicName: {
      type: String,
      default: "",
      trim: true,
    },

    clinicStreetAddress: {
      type: String,
      default: "",
      trim: true,
    },

    clinicBarangay: {
      type: String,
      default: "",
      trim: true,
    },

    clinicCityMunicipality: {
      type: String,
      default: "",
      trim: true,
    },

    clinicProvince: {
      type: String,
      default: "",
      trim: true,
    },

    clinicAddress: {
      type: String,
      default: "",
      trim: true,
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    pushNotificationToken: {
      type: String,
      default: "",
    },
    pushNotificationTokens: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const Doctor = models.Doctor || model("Doctor", DoctorSchema);
