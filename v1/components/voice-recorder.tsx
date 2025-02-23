'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Define types for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<number[]>([]);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let currentInterimTranscript = '';
        let currentFinalTranscript = transcript; // Keep existing final transcript

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptText = result[0].transcript;
          
          if (result.isFinal) {
            currentFinalTranscript += ' ' + transcriptText;
            setTranscript(currentFinalTranscript.trim());
            setInterimTranscript('');
          } else {
            currentInterimTranscript += transcriptText;
            setInterimTranscript(currentInterimTranscript);
          }
        }
      };

      // Add error handler
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'no-speech') {
          // Ignore no-speech errors as they're common during pauses
          return;
        }
        
        console.error('Speech recognition error:', event.error);
        
        if (isRecording) {
          try {
            recognitionRef.current?.stop();
            setTimeout(() => {
              if (isRecording && recognitionRef.current) {
                recognitionRef.current.start();
              }
            }, 1000);
          } catch (err) {
            console.error('Failed to restart recognition:', err);
            setStatus('idle');
            setIsRecording(false);
          }
        }
      };

      // Add end handler to restart if needed
      recognitionRef.current.onend = () => {
        console.log('Recognition ended, isRecording:', isRecording);
        if (isRecording && recognitionRef.current) {
          try {
            setTimeout(() => {
              if (isRecording && recognitionRef.current) {
                recognitionRef.current.start();
              }
            }, 100);
          } catch (err) {
            console.error('Failed to restart recognition:', err);
            setStatus('idle');
            setIsRecording(false);
          }
        }
      };
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Error stopping recognition:', err);
        }
      }
    };
  }, [transcript, isRecording]); // Add isRecording as dependency

  const startRecording = async () => {
    try {
      setStatus('recording');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio context and analyser
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Start speech recognition
      if (recognitionRef.current) {
        setTranscript('');
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.error('Error starting recognition:', err);
          setStatus('idle');
          setIsRecording(false);
        }
      }

      // Start visualization
      visualize();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setStatus('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      setStatus('processing');
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setAudioData([]);
      
      // Simulate processing delay for better UX
      setTimeout(() => {
        setStatus('idle');
      }, 1000);
    }
  };

  const visualize = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteTimeDomainData(dataArray);
    
    // Convert to normalized numbers for visualization
    const normalizedData = Array.from(dataArray).map(value => (value - 128) / 128);
    setAudioData(normalizedData);

    animationFrameRef.current = requestAnimationFrame(visualize);
  };

  return (
    <div className="w-full space-y-10">
      <div className="bg-card rounded-lg p-8 shadow-lg space-y-16">
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "default"}
              size="icon"
              className={cn(
                "w-48 h-48 rounded-full transition-all duration-300",
              )}
              disabled={status === 'processing'}
            >
              {status === 'processing' ? (
                <Loader2 className="w-16 h-16 animate-spin" />
              ) : isRecording ? (
                <Square className="w-16 h-16" />
              ) : (
                <Mic className="w-16 h-16" />
              )}
            </Button>
            {status === 'recording' && (
              <span className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
          
          <div className="w-full bg-muted rounded-lg overflow-hidden h-24">
            <div className="relative h-full">
              <div className="absolute inset-0 flex items-center justify-center">
                {audioData.length > 0 ? (
                  <div className="flex items-center h-full w-full px-2">
                    {audioData.map((value, index) => (
                      <div
                        key={index}
                        className="flex-1 mx-[0.5px] bg-primary"
                        style={{
                          height: `${Math.abs(value * 100)}%`,
                          transform: `scaleY(${isRecording ? 1 : 0.1})`,
                          transition: 'transform 0.1s ease-in-out',
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {status === 'processing' 
                      ? 'Processing...' 
                      : status === 'recording' 
                      ? 'Listening...' 
                      : 'Ready to record'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <label className="text-lg font-medium">Transcription</label>
            <span className="text-sm text-muted-foreground">
              {status === 'recording' && 'Recording in progress...'}
            </span>
          </div>
          <Textarea
            value={transcript + ' ' + interimTranscript}
            readOnly
            placeholder="Your voice will be transcribed here..."
            className="min-h-[400px] resize-none font-mono text-base"
          />
        </div>
      </div>
    </div>
  );
} 