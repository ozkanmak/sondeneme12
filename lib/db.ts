import { neon } from "@neondatabase/serverless"

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.warn("[v0] DATABASE_URL ortam degiskeni tanimli degil. Veritabani islemleri calismayacak.")
}

export const sql = DATABASE_URL
  ? neon(DATABASE_URL)
  : (async () => { throw new Error("DATABASE_URL tanimli degil") }) as any
