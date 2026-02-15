import { MongoClient, Db, Collection } from 'mongodb'

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not defined')
  }

  try {
    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db('smartkot')

    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}

export async function getCollection(
  collectionName: string
): Promise<Collection> {
  const { db } = await connectToDatabase()
  return db.collection(collectionName)
}
