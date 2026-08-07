import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  const categories = ["Minuman", "Makanan", "Snack", "Dessert"];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const all = await prisma.category.findMany();
  return NextResponse.json({ message: "Categories ensured", categories: all });
}
