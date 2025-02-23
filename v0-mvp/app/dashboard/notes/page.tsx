"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"

interface Note {
  id: string
  content: string
  categories: string[]
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const { data: session } = useSession()

  useEffect(() => {
    const fetchNotes = async () => {
      if (session?.user?.id) {
        const fetchedNotes = await db.select().from(notes).where(eq(notes.userId, session.user.id))
        setNotes(fetchedNotes)
      }
    }
    fetchNotes()
  }, [session, notes])

  const filteredNotes = notes.filter(
    (note) =>
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory === "" || note.categories.includes(filterCategory)),
  )

  const allCategories = Array.from(new Set(notes.flatMap((note) => note.categories)))

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-4">Your Notes</h1>
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border rounded-md p-2"
        >
          <option value="">All Categories</option>
          {allCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-4">
        {filteredNotes.map((note) => (
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
    </div>
  )
}

