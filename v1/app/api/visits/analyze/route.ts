import { NextResponse } from 'next/server'
import { type PatientName, type VetName, type Species, type Medication } from '@prisma/client'

const SYSTEM_PROMPT = `You are a veterinary assistant AI that analyzes transcribed notes from veterinary visits.
Your task is to extract key information from the transcribed text and format it according to the available options.

Available options for each field:
- VetName: DR_SMITH, DR_JOHNSON, DR_WILLIAMS, DR_BROWN, DR_DAVIS
- PatientName: MAX, BELLA, CHARLIE, LUNA, ROCKY
- Species: DOG, CAT, COW, CHICKEN, MONKEY
- Medications: PARACETAMOL, AMOXICILLIN, IBUPROFEN, KETAMINE, FENTANYL, LSD

Rules:
1. Only use values from the available options
2. If you can't find a match, use the most likely option based on context
3. For medications, you can select multiple options
4. Clean up and format the notes to be more professional
5. If you're not confident about a field, leave it empty

Return the data in JSON format with the following fields:
{
  vetName: string (one of VetName),
  patientName: string (one of PatientName),
  species: string (one of Species),
  medications: string[] (array of Medication),
  notes: string (cleaned up notes)
}`

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // In a real application, you would call an AI service here
    // For now, we'll use a simple mock implementation
    const analysis = analyzeText(text)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error analyzing text:', error)
    return NextResponse.json(
      { error: 'Error analyzing text' },
      { status: 500 }
    )
  }
}

// Mock implementation - replace with actual AI service call
function analyzeText(text: string): {
  vetName: VetName | "",
  patientName: PatientName | "",
  species: Species | "",
  medications: Medication[],
  notes: string
} {
  // Simple keyword matching for demonstration
  const vetMatch = text.match(/Dr\.\s*(\w+)/i)
  const vetName = vetMatch 
    ? Object.values(VetName).find(v => v.includes(vetMatch[1].toUpperCase())) || ""
    : "";

  const patientMatch = Object.values(PatientName).find(name => 
    text.toUpperCase().includes(name)
  ) || "";

  const speciesMatch = Object.values(Species).find(species => 
    text.toUpperCase().includes(species)
  ) || "";

  const medications = Object.values(Medication).filter(med => 
    text.toUpperCase().includes(med)
  );

  return {
    vetName,
    patientName,
    species: speciesMatch,
    medications,
    notes: text.trim()
  }
} 