import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vetName, patientName, species, medications, notes } = body;

    if (!vetName || !patientName || !species) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 },
      );
    }

    const visit = await prisma.visit.create({
      data: {
        vetName,
        patientName,
        species,
        medications,
        notes,
      },
    });

    return NextResponse.json(visit);
  } catch (error) {
    console.error("Error creating visit:", error);
    return NextResponse.json(
      { error: "Error creating visit" },
      { status: 500 },
    );
  }
}
