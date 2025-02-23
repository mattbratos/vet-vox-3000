"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square } from "lucide-react"

declare var webkitSpeechRecognition: any
declare var SpeechRecognition: any

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.error("Speech recognition not supported")
      return
    }

    recognitionRef.current = new webkitSpeechRecognition()
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        } else {
          interimTranscript += event.results[i][0].transcript
        }
      }

      setTranscript(finalTranscript + interimTranscript)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startRecording = () => {
    setIsRecording(true)
    setTranscript("")
    if (recognitionRef.current) {
      recognitionRef.current.start()
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    // Here you would typically send the transcript to your backend for processing
    console.log("Final transcript:", transcript)
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Voice Recorder</h2>
      <div className="flex justify-center mb-4">
        {isRecording ? (
          <Button onClick={stopRecording} variant="destructive">
            <Square className="mr-2 h-4 w-4" /> Stop Recording
          </Button>
        ) : (
          <Button onClick={startRecording}>
            <Mic className="mr-2 h-4 w-4" /> Start Recording
          </Button>
        )}
      </div>
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Transcript:</h3>
        <p className="p-2 bg-gray-100 rounded">{transcript || "Start speaking..."}</p>
      </div>
    </div>
  )
}

export default VoiceRecorder

