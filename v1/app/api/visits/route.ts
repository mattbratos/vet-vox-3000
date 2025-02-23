import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const visits = await prisma.visit.findMany({
      orderBy: { visitDate: "desc" },
    });
    return NextResponse.json(visits);
  } catch (error) {
    console.error("Error fetching visits:", error);
    return NextResponse.json(
      { error: "Error fetching visits" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, notes } = await request.json();

    if (!id || notes === undefined) {
      return NextResponse.json(
        { error: "ID and notes are required" },
        { status: 400 },
      );
    }

    const visit = await prisma.visit.update({
      where: { id },
      data: { notes },
    });

    return NextResponse.json(visit);
  } catch (error) {
    console.error("Error updating visit:", error);
    return NextResponse.json(
      { error: "Error updating visit" },
      { status: 500 },
    );
  }
}
