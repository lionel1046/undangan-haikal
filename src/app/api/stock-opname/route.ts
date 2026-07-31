import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const opnameList = await prisma.stockOpname.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        opnameItems: {
          include: { stockItem: true },
        },
      },
      take: 20,
    });

    const serialized = opnameList.map((op) => ({
      ...op,
      date: op.date.toISOString(),
      createdAt: op.createdAt.toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("Error fetching opname list:", error);
    return NextResponse.json({ error: "Failed to fetch opname list" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 });
    }

    const opname = await prisma.stockOpname.create({
      data: {
        notes: body.notes || null,
        createdById: body.createdById,
        opnameItems: {
          create: body.items.map((item: { stockItemId: string; systemStock: number; actualStock: number; difference: number }) => ({
            stockItemId: item.stockItemId,
            systemStock: item.systemStock,
            actualStock: item.actualStock,
            difference: item.difference,
          })),
        },
      },
      include: {
        opnameItems: {
          include: { stockItem: true },
        },
      },
    });

    // Update currentStock for each item
    await Promise.all(
      body.items.map((item: { stockItemId: string; actualStock: number }) =>
        prisma.stockItem.update({
          where: { id: item.stockItemId },
          data: { currentStock: item.actualStock },
        })
      )
    );

    // Fetch updated stock items to return fresh data
    const updatedStockItems = await prisma.stockItem.findMany({
      orderBy: { name: "asc" },
    });

    const serializedOpname = {
      ...opname,
      date: opname.date.toISOString(),
      createdAt: opname.createdAt.toISOString(),
    };

    return NextResponse.json({ opname: serializedOpname, stockItems: updatedStockItems }, { status: 201 });
  } catch (error) {
    console.error("Error creating opname:", error);
    return NextResponse.json({ error: "Failed to create opname" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.opnameItem.deleteMany({ where: { stockOpnameId: id } });
    await prisma.stockOpname.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting opname:", error);
    return NextResponse.json({ error: "Failed to delete opname" }, { status: 500 });
  }
}
