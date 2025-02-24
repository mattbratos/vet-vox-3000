import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { visitId, text } = await request.json();

    if (!visitId || !text) {
      return NextResponse.json(
        { error: "Visit ID and text are required" },
        { status: 400 },
      );
    }

    const updatedVisit = await prisma.visit.update({
      where: { id: visitId },
      data: { notes: text },
    });

    return NextResponse.json(updatedVisit);
  } catch (error) {
    console.error("Error updating visit notes:", error);
    return NextResponse.json(
      { error: "Error updating visit notes" },
      { status: 500 },
    );
  }
}
