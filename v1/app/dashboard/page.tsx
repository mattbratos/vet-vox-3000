import { AudioRecorderWithTranscription } from "@/components/audio-recorder-v2";
import { CreateVisitForm } from "@/components/create-visit-form";

export default function Dashboard() {
  const transcribedText =
    "so my name is DR_BROWN and today I was operating Bella she's a chicken and I gave her LSD";
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Record a Visit</h1>
        <p className="text-muted-foreground">
          Record and transcribe your veterinary visits
        </p>
      </div>

      <div className="space-y-8">
        <AudioRecorderWithTranscription />
      </div>

      <div className="create-visit-form">
        <CreateVisitForm transcribedText={transcribedText} />
      </div>
    </div>
  );
}
