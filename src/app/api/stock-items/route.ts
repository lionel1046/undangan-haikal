import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const items = await prisma.stockItem.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching stock items:", error);
    return NextResponse.json({ error: "Failed to fetch stock items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    if (!body.name || body.name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const item = await prisma.stockItem.create({
      data: {
        name: body.name.trim(),
        unit: body.unit,
        currentStock: body.currentStock,
        minStock: body.minStock,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating stock item:", error);
    return NextResponse.json({ error: "Failed to create stock item" }, { status: 500 });
  }
}
