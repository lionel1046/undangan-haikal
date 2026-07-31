import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const item = await prisma.stockItem.update({
      where: { id },
      data: {
        name: body.name,
        unit: body.unit,
        currentStock: body.currentStock,
        minStock: body.minStock,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating stock item:", error);
    return NextResponse.json({ error: "Failed to update stock item" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Remove references from opnameItems first
    await prisma.opnameItem.deleteMany({ where: { stockItemId: id } });
    await prisma.stockItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting stock item:", error);
    return NextResponse.json({ error: "Failed to delete stock item" }, { status: 500 });
  }
}
