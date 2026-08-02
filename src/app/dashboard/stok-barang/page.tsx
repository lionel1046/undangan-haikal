import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StokBarangClient from "./stok-barang-client";

export const dynamic = 'force-dynamic';

export default async function StokBarangPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  return <StokBarangClient isAdmin={isAdmin} />;
}
