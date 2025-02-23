"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Square, Save } from "lucide-react"
import { WaveformVisualizer } from "@/components/WaveformVisualizer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { db } from "@/lib/db"

declare var webkitSpeechRecognition: any

interface Note {
  id: string
  content: string
  categories: string[]
}

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [audioLevel, setAudioLevel] = useState(0)
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState<Note>({ id: "", content: "", categories: ["General"] })
  const [newCategory, setNewCategory] = useState("")
  const recognitionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    const savedNotes = localStorage.getItem("notes")
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }

    if (!("webkitSpeechRecognition" in window)) {
      console.error("Speech recognition not supported")
      return
    }

    recognitionRef.current = new webkitSpeechRecognition()
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true

    recognitionRef.current.onresult = (event: any) => {
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
      setCurrentNote((prev) => ({ ...prev, content: finalTranscript + interimTranscript }))
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && !event.repeat && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault()
        toggleRecording()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes))
  }, [notes])

  const initializeAudioAnalysis = async () => {
    try {
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

      const updateAudioLevel = () => {
        if (!analyserRef.current || !isRecording) return

        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
        setAudioLevel(average / 128) // Normalize to 0-1 range

        requestAnimationFrame(updateAudioLevel)
      }

      updateAudioLevel()
    } catch (err) {
      console.error("Error accessing microphone:", err)
    }
  }

  const toggleRecording = () => {
    if (!isRecording) {
      startRecording()
    } else {
      stopRecording()
    }
  }

  const startRecording = async () => {
    setIsRecording(true)
    setTranscript("")
    setCurrentNote({ id: Date.now().toString(), content: "", categories: ["General"] })
    await initializeAudioAnalysis()
    if (recognitionRef.current) {
      recognitionRef.current.start()
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    setAudioLevel(0)
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentNote((prev) => ({ ...prev, content: e.target.value }))
  }

  const handleAddCategory = () => {
    if (newCategory && !currentNote.categories.includes(newCategory)) {
      setCurrentNote((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory],
      }))
      setNewCategory("")
    }
  }

  const handleRemoveCategory = (category: string) => {
    setCurrentNote((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }))
  }

  const handleSaveNote = async () => {
    if (currentNote.content.trim() && session?.user?.id) {
      try {
        await db.insert(notes).values({
          userId: session.user.id,
          content: currentNote.content,
          categories: currentNote.categories,
        })
        setCurrentNote({ id: "", content: "", categories: ["General"] })
        setTranscript("")
      } catch (error) {
        console.error("Error saving note:", error)
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-8">Record Voice Note</h1>
      <div className="flex flex-col items-center space-y-8">
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <WaveformVisualizer isRecording={isRecording} audioLevel={audioLevel} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={toggleRecording}
          className={`relative group flex items-center justify-center w-24 h-24 rounded-full 
            ${isRecording ? "bg-destructive" : "bg-primary"} 
            transition-colors duration-200 shadow-lg hover:shadow-xl`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-white/20"
            animate={{
              scale: isRecording ? [1, 1.2, 1] : 1,
              opacity: isRecording ? [0.2, 0, 0.2] : 0.2,
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          {isRecording ? <Square className="h-8 w-8 text-white" /> : <Mic className="h-8 w-8 text-white" />}
          <span className="sr-only">{isRecording ? "Stop Recording" : "Start Recording"}</span>
        </motion.button>

        <div className="text-sm text-muted-foreground">
          Press <kbd className="px-2 py-1 bg-muted rounded">Space</kbd> to {isRecording ? "stop" : "start"} recording
        </div>

        <div className="w-full space-y-4">
          <Textarea
            placeholder="Your note content..."
            value={currentNote.content}
            onChange={handleContentChange}
            className="min-h-[100px]"
          />
          <div className="flex flex-wrap gap-2 mb-2">
            {currentNote.categories.map((category) => (
              <Badge key={category} variant="secondary" className="text-sm">
                {category}
                <button onClick={() => handleRemoveCategory(category)} className="ml-2 text-xs hover:text-destructive">
                  ×
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
            />
            <Button onClick={handleAddCategory}>Add</Button>
          </div>
          <Button onClick={handleSaveNote} className="w-full">
            <Save className="mr-2 h-4 w-4" /> Save Note
          </Button>
        </div>
      </div>
    </div>
  )
}

