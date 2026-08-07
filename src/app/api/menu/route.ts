import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await prisma.menuItem.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const item = await prisma.menuItem.create({
    data: {
      name: body.name,
      description: body.description || null,
      price: body.price,
      imageUrl: body.imageUrl || null,
      isAvailable: body.isAvailable ?? true,
      categoryId: body.categoryId,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
