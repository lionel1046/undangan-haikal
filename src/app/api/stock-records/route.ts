import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { itemName, initialStock, incoming, outgoing, finalStock, difference, date, notes } = body;

    const record = await prisma.dailyStockRecord.create({
      data: {
        itemName,
        initialStock,
        incoming: incoming || 0,
        outgoing: outgoing || 0,
        finalStock,
        difference,
        date: new Date(date),
        notes,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error creating stock record:", error);
    return NextResponse.json({ error: "Failed to create stock record" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const records = await prisma.dailyStockRecord.findMany({
      orderBy: { date: "desc" },
      take: 100,
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching stock records:", error);
    return NextResponse.json({ error: "Failed to fetch stock records" }, { status: 500 });
  }
}
