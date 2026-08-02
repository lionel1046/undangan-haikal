import { prisma } from "@/lib/prisma";
import MenuClient from "./menu-client";

export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  const [menuItems, categories] = await Promise.all([
    prisma.menuItem.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <MenuClient menuItems={menuItems} categories={categories} />;
}
