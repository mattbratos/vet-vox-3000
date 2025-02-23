import { AudioRecorderWithTranscription } from "@/components/audio-recorder";

export default function Dashboard() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="space-y-3 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Record a Note</h1>
        <p className="text-muted-foreground">
          Speak your thoughts, we&apos;ll transcribe them for you
        </p>
      </div>

      <div className="space-y-6">
        <AudioRecorderWithTranscription />
      </div>
    </div>
  );
}
