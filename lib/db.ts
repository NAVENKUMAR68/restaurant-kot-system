import { MongoClient, Db, Collection } from 'mongodb'

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    console.log('[v0] Using cached MongoDB connection')
    return { client: cachedClient, db: cachedDb }
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('[v0] MONGODB_URI environment variable is not set')
    throw new Error('MONGODB_URI is not defined')
  }

  console.log('[v0] Connecting to MongoDB Atlas...')

  try {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
    })

    await client.connect()
    console.log('[v0] MongoDB connected successfully')

    // Verify connection by pinging the server
    await client.db('admin').command({ ping: 1 })
    console.log('[v0] MongoDB ping successful - connection verified')

    const db = client.db('smartkot')

    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error('[v0] Failed to connect to MongoDB:', error instanceof Error ? error.message : error)
    throw new Error(`MongoDB connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getCollection(
  collectionName: string
): Promise<Collection> {
  const { db } = await connectToDatabase()
  return db.collection(collectionName)
}

// Export database connection for initialization
export { cachedClient, cachedDb }
