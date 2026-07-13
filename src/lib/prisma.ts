import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let _prisma: PrismaClient | null = null
let _dbAvailable = true

function createPrismaClient(): PrismaClient | null {
  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      datasources: undefined,
    })
    return client
  } catch {
    _dbAvailable = false
    return null
  }
}

export function getPrisma(): PrismaClient | null {
  if (!_dbAvailable) return null
  if (!_prisma) {
    _prisma = createPrismaClient()
    if (!_prisma) return null
  }
  return _prisma
}

// Backward compat — returns null when DB unavailable
export const prisma = (() => {
  if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
    _dbAvailable = false
    return null
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
})()

export const isDbAvailable = () => _dbAvailable
