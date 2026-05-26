import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const item = await prisma.stockItem.create({
    data: {
      name: body.name,
      unit: body.unit,
      currentStock: body.currentStock,
      minStock: body.minStock,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
