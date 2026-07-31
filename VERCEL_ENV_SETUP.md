# Windsurf Next Auto-Deployment Configuration

Windsurf Next akan melakukan deployment otomatis ke Vercel.

## Environment Variables untuk Production

Set these environment variables untuk Windsurf deployment:

1. **NEXTAUTH_URL**
   - Value: `https://hellomorningmama.com`
   - Purpose: NextAuth.js production URL

2. **NEXTAUTH_SECRET**
   - Value: Generate a secure random string
   - Purpose: JWT signing secret
   - Generate with: `openssl rand -base64 32`

3. **DATABASE_URL**
   - Value: Your production database connection string
   - Purpose: Prisma database connection

## Custom Domain

Pastikan domain `hellomorningmama.com` sudah dikonfigurasi di project Vercel Windsurf.

## Password Update API

Setelah deployment otomatis selesai, kunjungi `https://hellomorningmama.com/api/update-passwords` untuk update password user:
- admin@morningmama.com → "BersinarTerang2026"
- staff@morningmama.com → "staff2026"

Hapus file temporary setelah selesai: `src/app/api/update-passwords/route.ts`
