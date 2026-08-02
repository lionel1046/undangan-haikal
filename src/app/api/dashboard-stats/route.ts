import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [menuCount, categoryCount, stockCount] = await Promise.all([
      prisma.menuItem.count(),
      prisma.category.count(),
      prisma.stockItem.count(),
    ]);

    const allStockItems = await prisma.stockItem.findMany({ take: 20 }).catch(() => []);
    const lowStockItems = allStockItems.filter((s) => s.currentStock <= s.minStock).slice(0, 5);

    const recentOpname = await prisma.stockOpname.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { opnameItems: true },
    }).catch(() => []);

    return NextResponse.json({
      menuCount,
      categoryCount,
      stockCount,
      lowStockItems,
      recentOpname,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
