import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
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
    include: { opnameItems: true },
  });

  await Promise.all(
    body.items.map((item: { stockItemId: string; actualStock: number }) =>
      prisma.stockItem.update({
        where: { id: item.stockItemId },
        data: { currentStock: item.actualStock },
      })
    )
  );

  return NextResponse.json(opname, { status: 201 });
}
