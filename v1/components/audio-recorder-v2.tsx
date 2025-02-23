'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, Mic, Save, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CreateVisitForm } from "@/components/create-visit-form";
import { Timer } from "@/components/timer";

interface Props {
  className?: string;
  timerClassName?: string;
}

interface Record {
  id: number;
  name: string;
  file: Blob | null;
}

let recorder: MediaRecorder;
let recordingChunks: BlobPart[] = [];
let timerTimeout: NodeJS.Timeout;

const padWithLeadingZeros = (num: number, length: number): string => {
  return String(num).padStart(length, "0");
};

const downloadBlob = (blob: Blob) => {
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `Audio_${new Date().getMilliseconds()}.mp3`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

export const AudioRecorderWithTranscription = ({
  className,
  timerClassName,
}: Props) => {
  // States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [currentRecord, setCurrentRecord] = useState<Record>({
    id: -1,
    name: "",
    file: null,
  });
  const [transcribedText, setTranscribedText] = useState<string>("");

  // Calculate the hours, minutes, and seconds from the timer
  const hours = Math.floor(timer / 3600);
  const minutes = Math.floor((timer % 3600) / 60);
  const seconds = timer % 60;

  // Split the hours, minutes, and seconds into individual digits
  const [hourLeft, hourRight] = useMemo(
    () => padWithLeadingZeros(hours, 2).split(""),
    [hours],
  );
  const [minuteLeft, minuteRight] = useMemo(
    () => padWithLeadingZeros(minutes, 2).split(""),
    [minutes],
  );
  const [secondLeft, secondRight] = useMemo(
    () => padWithLeadingZeros(seconds, 2).split(""),
    [seconds],
  );

  // Refs
  const mediaRecorderRef = useRef<{
    stream: MediaStream | null;
    analyser: AnalyserNode | null;
    mediaRecorder: MediaRecorder | null;
    audioContext: AudioContext | null;
  }>({
    stream: null,
    analyser: null,
    mediaRecorder: null,
    audioContext: null,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  function startRecording() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then((stream) => {
          setIsRecording(true);
          // ============ Analyzing ============
          const AudioContext = window.AudioContext;
          const audioCtx = new AudioContext();
          const analyser = audioCtx.createAnalyser();
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
          mediaRecorderRef.current = {
            stream,
            analyser,
            mediaRecorder: null,
            audioContext: audioCtx,
          };

          const mimeType = MediaRecorder.isTypeSupported("audio/mpeg")
            ? "audio/mpeg"
            : MediaRecorder.isTypeSupported("audio/webm")
              ? "audio/webm"
              : "audio/wav";

          const options = { mimeType };
          mediaRecorderRef.current.mediaRecorder = new MediaRecorder(
            stream,
            options,
          );
          mediaRecorderRef.current.mediaRecorder.start();
          recordingChunks = [];
          // ============ Recording ============
          recorder = new MediaRecorder(stream);
          recorder.start();
          recorder.ondataavailable = (e) => {
            recordingChunks.push(e.data);
          };

          // Start speech recognition
          startSpeechRecognition();
        })
        .catch((error) => {
          console.error(error);
          toast.error("Error accessing microphone");
        });
    }
  }

  function stopRecording() {
    recorder.onstop = () => {
      const recordBlob = new Blob(recordingChunks, {
        type: "audio/wav",
      });
      setCurrentRecord({
        ...currentRecord,
        file: recordBlob,
      });
      recordingChunks = [];
    };

    recorder.stop();
    setIsRecording(false);
    setTimer(0);
    clearTimeout(timerTimeout);

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }

  function resetRecording() {
    const { mediaRecorder, stream, analyser, audioContext } =
      mediaRecorderRef.current;

    if (mediaRecorder) {
      mediaRecorder.onstop = () => {
        recordingChunks = [];
      };
      mediaRecorder.stop();
    }

    if (analyser) {
      analyser.disconnect();
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (audioContext) {
      audioContext.close();
    }
    setIsRecording(false);
    setTimer(0);
    clearTimeout(timerTimeout);

    cancelAnimationFrame(animationRef.current);
    const canvas = canvasRef.current;
    if (canvas) {
      const canvasCtx = canvas.getContext("2d");
      if (canvasCtx) {
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      }
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setTranscribedText("");
  }

  const handleSubmit = () => {
    stopRecording();
    downloadBlob(new Blob(recordingChunks, { type: "audio/wav" }));
  };

  function startSpeechRecognition() {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      let finalTranscript = "";

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setTranscribedText(
          finalTranscript.trim() + " " + interimTranscript.trim(),
        );
      };

      recognitionRef.current.start();
    } else {
      console.error("Speech recognition not supported in this browser.");
      toast.error("Speech recognition not supported in this browser");
    }
  }

  // Effect to update the timer every second
  useEffect(() => {
    if (isRecording) {
      timerTimeout = setTimeout(() => {
        setTimer(timer + 1);
      }, 1000);
    }
    return () => clearTimeout(timerTimeout);
  }, [isRecording, timer]);

  // Visualizer
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const drawWaveform = (dataArray: Uint8Array) => {
      if (!canvasCtx) return;
      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      canvasCtx.fillStyle = "#939393";

      const barWidth = 1;
      const spacing = 1;
      const maxBarHeight = HEIGHT / 2.5;
      const numBars = Math.floor(WIDTH / (barWidth + spacing));

      for (let i = 0; i < numBars; i++) {
        const barHeight = Math.pow(dataArray[i] / 128.0, 8) * maxBarHeight;
        const x = (barWidth + spacing) * i;
        const y = HEIGHT / 2 - barHeight / 2;
        canvasCtx.fillRect(x, y, barWidth, barHeight);
      }
    };

    const visualizeVolume = () => {
      if (
        !mediaRecorderRef.current?.stream?.getAudioTracks()[0]?.getSettings()
          .sampleRate
      )
        return;
      const bufferLength =
        (mediaRecorderRef.current?.stream?.getAudioTracks()[0]?.getSettings()
          .sampleRate as number) / 100;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!isRecording) {
          cancelAnimationFrame(animationRef.current);
          return;
        }
        animationRef.current = requestAnimationFrame(draw);
        mediaRecorderRef.current?.analyser?.getByteTimeDomainData(dataArray);
        drawWaveform(dataArray);
      };

      draw();
    };

    if (isRecording) {
      visualizeVolume();
    } else {
      if (canvasCtx) {
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      }
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isRecording]);

  const handleCreateVisit = () => {
    if (isRecording) {
      stopRecording();
    }

    if (!transcribedText.trim()) {
      toast.error("Cannot create visit without transcribed text");
      return;
    }

    // Scroll to the form
    document.querySelector('.create-visit-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center w-full max-w-5xl gap-8">
        <div
          className={cn(
            "flex h-16 rounded-md relative w-full items-center justify-center gap-2",
            {
              "border p-1": isRecording,
              "border-none p-0": !isRecording,
            },
            className,
          )}
        >
          {isRecording && (
            <Timer
              hourLeft={hourLeft}
              hourRight={hourRight}
              minuteLeft={minuteLeft}
              minuteRight={minuteRight}
              secondLeft={secondLeft}
              secondRight={secondRight}
              timerClassName={timerClassName}
            />
          )}
          <canvas
            ref={canvasRef}
            className={`h-full w-full bg-background ${!isRecording ? "hidden" : "flex"}`}
          />
          <div className="flex gap-2">
            {/* ========== Delete recording button ========== */}
            {isRecording && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={resetRecording}
                    size={"icon"}
                    variant={"destructive"}
                  >
                    <Trash size={15} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="m-2">
                  <span>Reset recording</span>
                </TooltipContent>
              </Tooltip>
            )}

            {/* ========== Start and send recording button ========== */}
            <Tooltip>
              <TooltipTrigger asChild>
                {!isRecording ? (
                  <Button onClick={() => startRecording()} size={"icon"}>
                    <Mic size={15} />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} size={"icon"}>
                    <Download size={15} />
                  </Button>
                )}
              </TooltipTrigger>
              <TooltipContent className="m-2">
                <span>
                  {!isRecording ? "Start recording" : "Download recording"}
                </span>
              </TooltipContent>
            </Tooltip>

            {/* ========== Create Visit button ========== */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleCreateVisit} size={"icon"}>
                  <Save size={15} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="m-2">
                <span>
                  {isRecording ? "Stop recording and create visit" : "Create visit"}
                </span>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="w-full space-y-8">
          <Textarea
            value={transcribedText}
            onChange={(e) => setTranscribedText(e.target.value)}
            placeholder="Transcribed text will appear here..."
            className="w-full h-40 resize-none"
          />

         
        </div>
      </div>
    </TooltipProvider>
  );
}; 