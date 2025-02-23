import { OpenAI } from "openai";
import { z } from "zod";
import { Medication, PatientName, Species, VetName } from "@prisma/client";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the schema for the visit analysis
const VisitAnalysisSchema = z.object({
  vetName: z.enum([
    "DR_SMITH",
    "DR_JOHNSON",
    "DR_WILLIAMS",
    "DR_BROWN",
    "DR_DAVIS",
    "UNKNOWN",
  ] as const),
  patientName: z.enum([
    "MAX",
    "BELLA",
    "CHARLIE",
    "LUNA",
    "ROCKY",
    "UNKNOWN",
  ] as const),
  species: z.enum([
    "DOG",
    "CAT",
    "COW",
    "CHICKEN",
    "MONKEY",
    "UNKNOWN",
  ] as const),
  medications: z.array(
    z.enum([
      "PARACETAMOL",
      "AMOXICILLIN",
      "IBUPROFEN",
      "KETAMINE",
      "FENTANYL",
      "LSD",
      "UNKNOWN",
      "NONE",
    ] as const),
  ),
  notes: z.string(),
  confidence: z.number().min(0).max(1),
});

export async function POST(request: Request) {
  try {
    const { transcribedNotes } = await request.json();

    if (!transcribedNotes) {
      return NextResponse.json(
        { error: "Transcribed notes are required" },
        { status: 400 },
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [
        {
          role: "system",
          content: `You are a veterinary assistant AI that analyzes transcribed veterinary visit notes.
          Extract the following information:
          - Vet name (if mentioned)
          - Patient name (if mentioned)
          - Species of the animal
          - Any medications mentioned
          - Clean up and summarize the notes
          
          If any information is unclear or not mentioned, use 'UNKNOWN'.
          For medications, if none are mentioned, use ['NONE'].
          Provide a confidence score between 0 and 1 for your analysis.
          
          Format your response as a JSON object with the following fields:
          - vetName: One of ${Object.values(VetName).join(", ")}
          - patientName: One of ${Object.values(PatientName).join(", ")}
          - species: One of ${Object.values(Species).join(", ")}
          - medications: Array of ${Object.values(Medication).join(", ")}
          - notes: string
          - confidence: number between 0 and 1`,
        },
        {
          role: "user",
          content: transcribedNotes,
        },
      ],
      response_format: {
        type: "json_object",
      },
    });

    const analysis = completion.choices[0].message.content;

    if (!analysis) {
      return NextResponse.json(
        { error: "Failed to analyze notes" },
        { status: 500 },
      );
    }

    const parsedAnalysis = JSON.parse(analysis);
    const validatedAnalysis = VisitAnalysisSchema.parse(parsedAnalysis);

    return NextResponse.json(validatedAnalysis);
  } catch (error) {
    console.error("Error analyzing notes:", error);
    return NextResponse.json(
      { error: "Failed to analyze notes" },
      { status: 500 },
    );
  }
}
