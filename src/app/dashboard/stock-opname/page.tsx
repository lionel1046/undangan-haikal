import { prisma } from "@/lib/prisma";
import StockOpnameClient from "./stock-opname-client";

export default async function StockOpnamePage() {
  const [stockItems, opnameList] = await Promise.all([
    prisma.stockItem.findMany({ orderBy: { name: "asc" } }),
    prisma.stockOpname.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        opnameItems: {
          include: { stockItem: true },
        },
      },
      take: 20,
    }),
  ]);

  const serializedOpnameList = opnameList.map((op) => ({
    ...op,
    date: op.date.toISOString(),
    createdAt: op.createdAt.toISOString(),
  }));

  return <StockOpnameClient stockItems={stockItems} opnameList={serializedOpnameList} />;
}
