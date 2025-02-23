"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface Note {
  id: string
  content: string
  categories: string[]
}

export function NoteEditor() {
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState<Note>({ id: "", content: "", categories: ["General"] })
  const [newCategory, setNewCategory] = useState("")

  useEffect(() => {
    // Load notes from localStorage
    const savedNotes = localStorage.getItem("notes")
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }, [])

  useEffect(() => {
    // Save notes to localStorage whenever they change
    localStorage.setItem("notes", JSON.stringify(notes))
  }, [notes])

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

  const handleSaveNote = () => {
    if (currentNote.content.trim()) {
      const newNote = {
        ...currentNote,
        id: currentNote.id || Date.now().toString(),
      }
      setNotes((prev) => [...prev, newNote])
      setCurrentNote({ id: "", content: "", categories: ["General"] })
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Write your note here..."
        value={currentNote.content}
        onChange={handleContentChange}
        className="min-h-[100px]"
      />
      <div className="flex flex-wrap gap-2 mb-2">
        {currentNote.categories.map((category) => (
          <Badge key={category} variant="secondary" className="text-sm">
            {category}
            <button onClick={() => handleRemoveCategory(category)} className="ml-2 text-xs hover:text-destructive">
              <X size={12} />
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
        Save Note
      </Button>
    </div>
  )
}

