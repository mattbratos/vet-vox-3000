"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

interface Note {
  id: string
  content: string
  categories: string[]
}

export function NotesList() {
  const [notes, setNotes] = useState<Note[]>([])

  useEffect(() => {
    // Load notes from localStorage
    const savedNotes = localStorage.getItem("notes")
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Notes</h2>
      {notes.map((note) => (
        <div key={note.id} className="p-4 bg-muted rounded-lg">
          <p className="mb-2">{note.content}</p>
          <div className="flex flex-wrap gap-2">
            {note.categories.map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

