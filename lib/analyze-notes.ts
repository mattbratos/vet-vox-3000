import { Medication, PatientName, Species, VetName } from "@prisma/client";

export interface VisitAnalysis {
  vetName: VetName;
  patientName: PatientName;
  species: Species;
  medications: Medication[];
  notes: string;
  confidence: number;
}

export class AnalysisError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = "AnalysisError";
  }
}

export async function analyzeTranscribedNotes(
  transcribedText: string,
): Promise<VisitAnalysis> {
  if (!transcribedText?.trim()) {
    throw new AnalysisError("Transcribed notes cannot be empty");
  }

  try {
    const response = await fetch("/api/visits/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transcribedNotes: transcribedText }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new AnalysisError(
        data.error || `Failed to analyze notes: ${response.statusText}`,
        { status: response.status, data },
      );
    }

    const data = await response.json();
    return data as VisitAnalysis;
  } catch (error) {
    if (error instanceof AnalysisError) {
      throw error;
    }
    throw new AnalysisError("Failed to analyze notes", error);
  }
}
