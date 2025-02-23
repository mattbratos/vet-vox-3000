"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { VetName, PatientName, Species, Medication } from "@prisma/client";
import { analyzeTranscribedNotes, AnalysisError } from "@/lib/analyze-notes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface CreateVisitFormProps {
  transcribedText: string;
}

export function CreateVisitForm({ transcribedText }: CreateVisitFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [vetName, setVetName] = useState<VetName | "">("");
  const [patientName, setPatientName] = useState<PatientName | "">("");
  const [species, setSpecies] = useState<Species | "">("");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [notes, setNotes] = useState(transcribedText);
  const [confidence, setConfidence] = useState<number | null>(null);

  const handleCreateVisit = async () => {
    if (!vetName || !patientName || !species) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/visits/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vetName,
          patientName,
          species,
          medications,
          notes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create visit");
      }

      toast.success("Visit created successfully");
      // Reset form
      setVetName("");
      setPatientName("");
      setSpecies("");
      setMedications([]);
      setNotes("");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Please try again.";
      toast.error("Failed to create visit", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!transcribedText.trim()) {
      toast.error("Please provide some text to analyze");
      return;
    }

    try {
      setIsLoading(true);
      const analysis = await analyzeTranscribedNotes(transcribedText);

      setVetName(analysis.vetName);
      setPatientName(analysis.patientName);
      setSpecies(analysis.species);
      setMedications(analysis.medications);
      setNotes(analysis.notes);
      setConfidence(analysis.confidence);

      toast.success("Text analyzed successfully");

      if (analysis.confidence < 0.7) {
        toast.warning("Low confidence in analysis", {
          description: "Please review and correct the fields as needed.",
        });
      }
    } catch (error: unknown) {
      console.error("Analysis error:", error);

      const message =
        error instanceof AnalysisError
          ? error.message
          : "Please fill in the fields manually.";

      toast.error("Failed to analyze text", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 border rounded-lg p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Create New Visit</h2>
        <Button
          onClick={handleAnalyzeWithAI}
          disabled={isLoading || !transcribedText}
          className="relative"
        >
          {isLoading ? "Analyzing..." : "Analyze with AI"}
        </Button>
      </div>

      {confidence !== null && (
        <Alert variant={confidence >= 0.7 ? "default" : "warning"}>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>AI Analysis Confidence</AlertTitle>
          <AlertDescription>
            {confidence >= 0.7
              ? "High confidence in the analysis results."
              : "Low confidence in some fields. Please review the analysis carefully."}{" "}
            (Score: {Math.round(confidence * 100)}%)
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="vet">Veterinarian</Label>
          <Select
            value={vetName}
            onValueChange={(value) => setVetName(value as VetName)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select veterinarian" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(VetName).map((name) => (
                <SelectItem key={name} value={name}>
                  {name.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="patient">Patient</Label>
          <Select
            value={patientName}
            onValueChange={(value) => setPatientName(value as PatientName)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PatientName).map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="species">Species</Label>
          <Select
            value={species}
            onValueChange={(value) => setSpecies(value as Species)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select species" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(Species).map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="medications">Medications</Label>
          <Select
            value={medications[0] || ""}
            onValueChange={(value) => setMedications([value as Medication])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select medications" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(Medication).map((med) => (
                <SelectItem key={med} value={med}>
                  {med}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-40"
          />
        </div>

        <Button
          onClick={handleCreateVisit}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Creating..." : "Create Visit"}
        </Button>
      </div>
    </div>
  );
}
