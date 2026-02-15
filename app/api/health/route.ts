import { connectToDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('[v0] Health check endpoint called')

    // Verify MongoDB connection
    const { db } = await connectToDatabase()

    // Check if database is accessible
    const adminDb = db.admin()
    const status = await adminDb.ping()

    console.log('[v0] Health check passed - MongoDB is connected')

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'MongoDB connected successfully',
      mongodbUri: process.env.MONGODB_URI ? 'configured' : 'missing',
      nextAuthUrl: process.env.NEXTAUTH_URL ? 'configured' : 'missing',
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'configured' : 'missing',
    })
  } catch (error) {
    console.error(
      '[v0] Health check failed:',
      error instanceof Error ? error.message : error
    )

    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
