import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { itemName, initialStock, incoming, outgoing, finalStock, difference, date, notes } = body;

    const record = await prisma.dailyStockRecord.update({
      where: { id },
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
    console.error("Error updating stock record:", error);
    return NextResponse.json({ error: "Failed to update stock record" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.dailyStockRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting stock record:", error);
    return NextResponse.json({ error: "Failed to delete stock record" }, { status: 500 });
  }
}
