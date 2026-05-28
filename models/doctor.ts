import { Schema, models, model } from "mongoose";

const TimeSlotSchema = new Schema(
  {
    day: {
      type: String,
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
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const DoctorSchema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
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
        enum: ["video", "in_person", "phone"],
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

    workingHours: {
      type: [TimeSlotSchema],
      default: [],
    },

    unavailableSlots: [
      {
        date: {
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
        reason: {
          type: String,
          default: "Blocked",
        },
      },
    ],

    consultationDurationMinutes: {
      type: Number,
      default: 30,
    },

    clinicAddress: {
      type: String,
      default: "",
    },

    pushNotificationToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Doctor = models.Doctor || model("Doctor", DoctorSchema);