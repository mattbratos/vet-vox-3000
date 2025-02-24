"use client";

import { AudioRecorderWithTranscription } from "@/components/audio-recorder";
import { CreateVisitForm } from "@/components/create-visit-form";
import { useState } from "react";

export default function Dashboard() {
  const [transcribedText, setTranscribedText] = useState("");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Record a Visit</h1>
        <p className="text-muted-foreground">
          Record and transcribe your veterinary visits
        </p>
      </div>

      <div className="space-y-8">
        <AudioRecorderWithTranscription
          onTranscriptionChange={setTranscribedText}
        />
      </div>

      <div className="create-visit-form">
        <CreateVisitForm transcribedText={transcribedText} />
      </div>
    </div>
  );
}
