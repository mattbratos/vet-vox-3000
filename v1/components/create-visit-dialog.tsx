"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { type PatientName, type VetName, type Species, type Medication } from "@prisma/client";

interface CreateVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transcribedText: string;
}

export function CreateVisitDialog({ open, onOpenChange, transcribedText }: CreateVisitDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [vetName, setVetName] = useState<VetName | "">("");
  const [patientName, setPatientName] = useState<PatientName | "">("");
  const [species, setSpecies] = useState<Species | "">("");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [notes, setNotes] = useState(transcribedText);

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

      if (!response.ok) throw new Error("Failed to create visit");

      toast.success("Visit created successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create visit", {
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeWithAI = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/visits/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcribedText }),
      });

      if (!response.ok) throw new Error("Failed to analyze text");

      const data = await response.json();
      setVetName(data.vetName);
      setPatientName(data.patientName);
      setSpecies(data.species);
      setMedications(data.medications);
      setNotes(data.notes);

      toast.success("Text analyzed successfully");
    } catch (error) {
      toast.error("Failed to analyze text", {
        description: "Please fill in the fields manually.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Visit</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Button onClick={handleAnalyzeWithAI} disabled={isLoading || !transcribedText}>
              Analyze with AI
            </Button>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="vet">Veterinarian</Label>
            <Select value={vetName} onValueChange={(value) => setVetName(value as VetName)}>
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
            <Select value={patientName} onValueChange={(value) => setPatientName(value as PatientName)}>
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
            <Select value={species} onValueChange={(value) => setSpecies(value as Species)}>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateVisit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Visit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 