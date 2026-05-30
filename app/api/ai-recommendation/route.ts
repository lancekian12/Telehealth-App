// app/api/ai-recommendation/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DoctorInput = {
  id?: string;
  _id?: string;
  name?: string;
  fullName?: string;
  doctorName?: string;
  specialization?: string;
  specialty?: string;
  field?: string;
  expertise?: string | string[];
  specialties?: string | string[];
  location?: string;
  city?: string;
  clinicAddress?: string;
  [key: string]: unknown;
};

type RecommendationRequest = {
  query?: string;
  symptoms?: string;
  concern?: string;
  location?: string;
  doctors?: DoctorInput[];
};

type AiRecommendation = {
  urgency: "routine" | "soon" | "urgent" | "emergency";
  specializations: string[];
  summary: string;
  redFlags: string[];
  searchKeywords: string[];
  confidence: number;
};

type RankedDoctor = {
  id: string;
  name: string;
  specialization: string;
  location: string;
  score: number;
  reason: string;
};

type ApiResponse = {
  success: boolean;
  source: "gemini" | "fallback";
  input: string;
  location: string;
  recommendation: AiRecommendation;
  suggestedSpecializations: string[];
  suggestedDoctors: RankedDoctor[];
  disclaimer: string;
};

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

const SPECIALTY_KEYWORDS: Array<{
  specialization: string;
  keywords: string[];
  urgency?: "routine" | "soon" | "urgent" | "emergency";
}> = [
  {
    specialization: "Emergency Medicine",
    keywords: [
      "chest pain",
      "trouble breathing",
      "shortness of breath",
      "fainting",
      "stroke",
      "one-sided weakness",
      "severe bleeding",
      "seizure",
    ],
    urgency: "emergency",
  },
  {
    specialization: "Cardiology",
    keywords: [
      "chest pain",
      "palpitations",
      "high blood pressure",
      "shortness of breath",
      "heart",
    ],
    urgency: "urgent",
  },
  {
    specialization: "General Practitioner",
    keywords: [
      "fever",
      "cough",
      "sore throat",
      "flu",
      "cold",
      "headache",
      "body aches",
      "general checkup",
      "primary care",
      "primary doctor",
    ],
    urgency: "routine",
  },
  {
    specialization: "Family Medicine",
    keywords: [
      "fever",
      "cough",
      "sore throat",
      "flu",
      "general checkup",
      "primary care",
    ],
    urgency: "routine",
  },
  {
    specialization: "Internal Medicine",
    keywords: [
      "fever",
      "fatigue",
      "body aches",
      "infection",
      "multiple symptoms",
      "general checkup",
    ],
    urgency: "soon",
  },
  {
    specialization: "Pulmonology",
    keywords: [
      "cough",
      "wheezing",
      "asthma",
      "shortness of breath",
      "phlegm",
      "respiratory",
    ],
    urgency: "soon",
  },
  {
    specialization: "Dermatology",
    keywords: ["rash", "itching", "hives", "acne", "eczema", "skin", "blister"],
    urgency: "routine",
  },
  {
    specialization: "Neurology",
    keywords: [
      "headache",
      "migraine",
      "dizziness",
      "seizure",
      "numbness",
      "weakness",
      "confusion",
    ],
    urgency: "urgent",
  },
  {
    specialization: "Orthopedics",
    keywords: [
      "back pain",
      "joint pain",
      "bone pain",
      "sprain",
      "fracture",
      "muscle injury",
    ],
    urgency: "soon",
  },
  {
    specialization: "ENT (Otolaryngology)",
    keywords: [
      "sore throat",
      "ear pain",
      "sinus",
      "runny nose",
      "tonsil",
      "voice hoarseness",
    ],
    urgency: "routine",
  },
  {
    specialization: "Gastroenterology",
    keywords: [
      "stomach pain",
      "abdominal pain",
      "diarrhea",
      "vomiting",
      "acid reflux",
      "bloating",
    ],
    urgency: "soon",
  },
  {
    specialization: "OB-GYN",
    keywords: [
      "pregnancy",
      "menstrual",
      "period",
      "vaginal bleeding",
      "pelvic pain",
      "prenatal",
    ],
    urgency: "soon",
  },
  {
    specialization: "Urology",
    keywords: [
      "urine",
      "burning urination",
      "kidney pain",
      "blood in urine",
      "bladder",
    ],
    urgency: "soon",
  },
  {
    specialization: "Psychiatry",
    keywords: [
      "anxiety",
      "depression",
      "panic",
      "insomnia",
      "stress",
      "mental health",
    ],
    urgency: "routine",
  },
  {
    specialization: "Ophthalmology",
    keywords: [
      "eye pain",
      "blurred vision",
      "vision loss",
      "red eye",
      "floaters",
    ],
    urgency: "soon",
  },
];

const SPECIALTY_ALIASES: Record<string, string[]> = {
  "general practitioner": [
    "general practitioner",
    "family medicine",
    "internal medicine",
    "primary care",
    "general physician",
  ],
  "family medicine": [
    "family medicine",
    "general practitioner",
    "internal medicine",
    "primary care",
    "general physician",
  ],
  "internal medicine": [
    "internal medicine",
    "general practitioner",
    "family medicine",
    "primary care",
    "general physician",
  ],
  cardiology: ["cardiology", "cardiologist", "heart specialist"],
  pulmonology: ["pulmonology", "pulmonologist", "lung specialist"],
  dermatology: ["dermatology", "dermatologist", "skin specialist"],
  neurology: ["neurology", "neurologist", "brain specialist"],
  orthopedics: ["orthopedics", "orthopedic", "orthopedist", "bone specialist"],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function getStringArray(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

function uniqueStrings(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function clampConfidence(value: unknown): number {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 0.5;
  return Math.min(1, Math.max(0, n));
}

function matchesSpecialty(doctorSpecialty: string, targetSpecialty: string) {
  const doctor = normalizeText(doctorSpecialty);
  const target = normalizeText(targetSpecialty);

  const doctorAliases = SPECIALTY_ALIASES[doctor] ?? [doctor];
  const targetAliases = SPECIALTY_ALIASES[target] ?? [target];

  return doctorAliases.some((d) =>
    targetAliases.some((t) => d.includes(t) || t.includes(d)),
  );
}

function buildFallbackRecommendation(input: string): AiRecommendation {
  const normalized = normalizeText(input);

  const hits = SPECIALTY_KEYWORDS.map((entry) => {
    const matchedKeywords = entry.keywords.filter((keyword) =>
      normalized.includes(keyword.toLowerCase()),
    );

    return {
      specialization: entry.specialization,
      matchedKeywords,
      score: matchedKeywords.length,
      urgency: entry.urgency ?? "routine",
    };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const top = hits.length > 0 ? hits : [];

  const specializations =
    top.length > 0
      ? uniqueStrings(top.map((item) => item.specialization)).slice(0, 3)
      : ["General Practitioner", "Internal Medicine", "Family Medicine"];

  const urgency =
    top[0]?.urgency ??
    (normalized.includes("chest pain") || normalized.includes("trouble breathing")
      ? "urgent"
      : "routine");

  const redFlags =
    urgency === "emergency"
      ? [
          "Severe chest pain or pressure",
          "Trouble breathing",
          "Fainting or collapse",
          "One-sided weakness or face droop",
        ]
      : urgency === "urgent"
        ? [
            "Symptoms are getting worse quickly",
            "High fever that does not improve",
            "Severe pain",
          ]
        : [];

  const searchKeywords =
    top.length > 0
      ? uniqueStrings(
          top.flatMap((item) => [
            item.specialization,
            ...item.matchedKeywords.slice(0, 2),
          ]),
        )
      : uniqueStrings(["general practitioner", "internal medicine", "family medicine"]);

  return {
    urgency,
    specializations,
    summary:
      top.length > 0
        ? `Symptoms most closely match: ${specializations.join(", ")}.`
        : "Symptoms are general enough that a primary care or internal medicine doctor is a safe starting point.",
    redFlags,
    searchKeywords,
    confidence: top.length > 0 ? 0.72 : 0.45,
  };
}

function normalizeGeminiOutput(
  value: unknown,
  fallbackInput: string,
): AiRecommendation {
  if (!isRecord(value)) return buildFallbackRecommendation(fallbackInput);

  const urgencyRaw = getString(value.urgency, "routine");
  const urgency: AiRecommendation["urgency"] =
    urgencyRaw === "emergency" ||
    urgencyRaw === "urgent" ||
    urgencyRaw === "soon" ||
    urgencyRaw === "routine"
      ? urgencyRaw
      : "routine";

  const specializations = uniqueStrings(
    getStringArray(value.specializations),
  ).slice(0, 5);
  const redFlags = uniqueStrings(getStringArray(value.redFlags)).slice(0, 5);
  const searchKeywords = uniqueStrings(
    getStringArray(value.searchKeywords),
  ).slice(0, 10);

  return {
    urgency,
    specializations:
      specializations.length > 0
        ? specializations
        : buildFallbackRecommendation(fallbackInput).specializations,
    summary:
      getString(value.summary).trim() ||
      buildFallbackRecommendation(fallbackInput).summary,
    redFlags,
    searchKeywords:
      searchKeywords.length > 0
        ? searchKeywords
        : buildFallbackRecommendation(fallbackInput).searchKeywords,
    confidence: clampConfidence(value.confidence),
  };
}

function normalizeDoctor(raw: DoctorInput): {
  id: string;
  name: string;
  specialization: string;
  expertiseText: string;
  location: string;
} {
  const id = getString(raw.id) || getString(raw._id) || crypto.randomUUID();

  const name =
    getString(raw.name) ||
    getString(raw.fullName) ||
    getString(raw.doctorName) ||
    "Unknown Doctor";

  const specialization =
    getString(raw.specialization) ||
    getString(raw.specialty) ||
    getString(raw.field) ||
    "";

  const expertiseText = uniqueStrings([
    ...getStringArray(raw.expertise),
    ...getStringArray(raw.specialties),
    specialization,
  ])
    .join(" ")
    .toLowerCase();

  const location =
    getString(raw.location) || getString(raw.city) || getString(raw.clinicAddress) || "";

  return { id, name, specialization, expertiseText, location };
}

function rankDoctors(
  doctors: DoctorInput[] | undefined,
  recommendation: AiRecommendation,
  location: string,
  input: string,
): RankedDoctor[] {
  if (!doctors || doctors.length === 0) return [];

  const normalizedInput = normalizeText(input);
  const normalizedLocation = normalizeText(location);
  const targetSpecs = recommendation.specializations.map((item) => normalizeText(item));
  const targetKeywords = [
    ...targetSpecs,
    ...recommendation.searchKeywords.map((item) => normalizeText(item)),
    ...normalizedInput.split(" ").filter((word) => word.length > 3),
  ];

  const ranked = doctors
    .map((doctor) => {
      const d = normalizeDoctor(doctor);
      const specializationText = normalizeText(d.specialization);
      const doctorText = normalizeText(
        `${d.name} ${d.specialization} ${d.expertiseText} ${d.location}`,
      );

      let score = 0;
      const reasons: string[] = [];

      for (const spec of targetSpecs) {
        if (matchesSpecialty(d.specialization, spec) || doctorText.includes(spec)) {
          score += 6;
          reasons.push(`Matches ${spec}`);
          break;
        }
      }

      for (const keyword of targetKeywords) {
        if (keyword.length >= 4 && doctorText.includes(keyword)) {
          score += 2;
        }
      }

      if (
        normalizedLocation &&
        normalizeText(d.location).includes(normalizedLocation)
      ) {
        score += 2;
        reasons.push("Matches location");
      }

      if (score === 0 && recommendation.specializations.length > 0) {
        score = 1;
      }

      return {
        id: d.id,
        name: d.name,
        specialization: d.specialization || "General Practice",
        location: d.location || "Unknown location",
        score,
        reason:
          reasons.length > 0
            ? reasons.join(" · ")
            : "Closest available match based on the symptoms",
      };
    })
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, 6);
}

function buildSystemPrompt(
  input: string,
  location: string,
  doctorsCount: number,
): string {
  return `
You are a medical triage and doctor-matching assistant for patients in the Philippines.

Rules:
- Do NOT diagnose.
- Do NOT mention uncertain medical conclusions as facts.
- Return ONLY JSON that matches the schema.
- Recommend the most relevant doctor specializations for the symptoms.
- Include emergency guidance if symptoms sound dangerous.
- Use the user's location only to help match nearby doctor specialties if helpful.
- If the symptoms suggest emergency care, set urgency to "emergency".

User symptoms/concern:
${input}

Location:
${location || "Not provided"}

Number of doctors available in the database:
${doctorsCount}
`.trim();
}

async function askGemini(
  input: string,
  location: string,
  doctorsCount: number,
): Promise<AiRecommendation> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return buildFallbackRecommendation(input);
  }

  const ai = new GoogleGenAI({ apiKey });

  const responseSchema = {
    type: "object",
    properties: {
      urgency: {
        type: "string",
        enum: ["routine", "soon", "urgent", "emergency"],
        description: "How quickly the patient should seek care.",
      },
      specializations: {
        type: "array",
        items: { type: "string" },
        description: "Best matching doctor specialties.",
      },
      summary: {
        type: "string",
        description: "Short explanation of why those specialties fit.",
      },
      redFlags: {
        type: "array",
        items: { type: "string" },
        description: "Symptoms that require urgent attention.",
      },
      searchKeywords: {
        type: "array",
        items: { type: "string" },
        description: "Keywords to help match doctor records.",
      },
      confidence: {
        type: "number",
        description: "A score from 0 to 1 describing confidence.",
      },
    },
    required: [
      "urgency",
      "specializations",
      "summary",
      "redFlags",
      "searchKeywords",
      "confidence",
    ],
    additionalProperties: false,
  } as const;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildSystemPrompt(input, location, doctorsCount),
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const rawText = response.text ?? "";

  if (!rawText.trim()) {
    return buildFallbackRecommendation(input);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return buildFallbackRecommendation(input);
  }

  return normalizeGeminiOutput(parsed, input);
}

function getInputText(body: RecommendationRequest): string {
  return (
    [body.query, body.symptoms, body.concern]
      .map((item) => item?.trim())
      .find(Boolean) || ""
  );
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as RecommendationRequest;

    const input = getInputText(body);
    const location = getString(body.location);

    if (!input) {
      return NextResponse.json(
        {
          success: false,
          source: "fallback",
          message: "Please provide symptoms, concern, or a query.",
        },
        { status: 400 },
      );
    }

    let recommendation: AiRecommendation;
    let source: ApiResponse["source"] = "gemini";

    try {
      recommendation = await askGemini(input, location, body.doctors?.length || 0);
    } catch {
      recommendation = buildFallbackRecommendation(input);
      source = "fallback";
    }

    const suggestedDoctors = rankDoctors(
      body.doctors,
      recommendation,
      location,
      input,
    );

    const response: ApiResponse = {
      success: true,
      source,
      input,
      location,
      recommendation,
      suggestedSpecializations: recommendation.specializations,
      suggestedDoctors,
      disclaimer:
        "This is not a diagnosis. If symptoms are severe, sudden, or life-threatening, seek emergency care immediately.",
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      {
        success: false,
        source: "fallback",
        message: "Unable to process request.",
      },
      { status: 500 },
    );
  }
}