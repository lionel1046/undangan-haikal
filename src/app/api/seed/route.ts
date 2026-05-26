import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const existing = await prisma.user.findUnique({ where: { email: "admin@morningmama.com" } });
  if (existing) {
    return NextResponse.json({ message: "Admin sudah ada", email: "admin@morningmama.com" });
  }

  const hash = await bcrypt.hash("admin123", 10);

  const [admin, staffUser] = await Promise.all([
    prisma.user.create({
      data: { name: "Admin Morning Mama", email: "admin@morningmama.com", password: hash, role: "ADMIN" },
    }),
    prisma.user.create({
      data: { name: "Staff Morning Mama", email: "staff@morningmama.com", password: await bcrypt.hash("staff123", 10), role: "STAFF" },
    }),
  ]);

  const category = await prisma.category.create({ data: { name: "Minuman" } });
  await prisma.category.createMany({
    data: [{ name: "Makanan" }, { name: "Snack" }, { name: "Dessert" }],
    skipDuplicates: true,
  });

  await prisma.menuItem.createMany({
    data: [
      { name: "Kopi Aceh Spesial", description: "Arabika Gayo pour-over", price: 25000, categoryId: category.id },
      { name: "Matcha Latte", description: "Matcha ceremonial dengan susu oat", price: 30000, categoryId: category.id },
      { name: "Es Kopi Susu", description: "Kopi susu khas Morning Mama", price: 28000, categoryId: category.id },
    ],
  });

  await prisma.stockItem.createMany({
    data: [
      { name: "Biji Kopi Arabika", unit: "kg", currentStock: 10, minStock: 2 },
      { name: "Susu Full Cream", unit: "liter", currentStock: 20, minStock: 5 },
      { name: "Matcha Powder", unit: "gram", currentStock: 500, minStock: 100 },
      { name: "Gula Pasir", unit: "kg", currentStock: 15, minStock: 3 },
    ],
  });

  return NextResponse.json({
    message: "Seed berhasil!",
    users: [
      { role: "ADMIN", email: "admin@morningmama.com", password: "admin123" },
      { role: "STAFF", email: "staff@morningmama.com", password: "staff123" },
    ],
  });
}
