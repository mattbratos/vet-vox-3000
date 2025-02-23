import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { text } = await request.json()
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const note = await prisma.note.create({
      data: { text }
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error saving note:', error)
    return NextResponse.json(
      { error: 'Error saving note' },
      { status: 500 }
    )
  }
} 