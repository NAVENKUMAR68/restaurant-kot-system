'use server'

import { connectToDatabase } from './db'

let initialized = false

export async function initializeDatabase() {
  if (initialized) {
    console.log('[v0] Database already initialized')
    return true
  }

  try {
    console.log('[v0] Initializing database...')
    const { db } = await connectToDatabase()

    // Verify we can access the database
    const collections = await db.listCollections().toArray()
    console.log(
      `[v0] Database initialized successfully. Found ${collections.length} collections`
    )

    initialized = true
    return true
  } catch (error) {
    console.error(
      '[v0] Failed to initialize database:',
      error instanceof Error ? error.message : error
    )
    return false
  }
}
