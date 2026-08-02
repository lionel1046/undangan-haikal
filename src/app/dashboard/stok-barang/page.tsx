import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StokBarangClient from "./stok-barang-client";

export const dynamic = 'force-dynamic';

export default async function StokBarangPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  const records = await prisma.dailyStockRecord.findMany({
    orderBy: { date: "desc" },
    take: 100,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayRecords = records.filter((r) => {
    const recordDate = new Date(r.date);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === today.getTime();
  });

  const totalItems = records.length;
  const totalOutToday = todayRecords.reduce((sum, r) => sum + r.outgoing, 0);
  const lowStockCount = todayRecords.filter((r) => r.finalStock < 10).length;
  const totalStockAvailable = todayRecords.reduce((sum, r) => sum + r.finalStock, 0);

  return (
    <StokBarangClient
      initialRecords={records}
      stats={{
        totalItems,
        totalOutToday,
        lowStockCount,
        totalStockAvailable,
      }}
      isAdmin={isAdmin}
    />
  );
}
