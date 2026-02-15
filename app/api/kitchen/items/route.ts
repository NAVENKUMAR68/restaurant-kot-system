import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-utils'
import { getCollection } from '@/lib/db'
import { handleAPIError } from '@/lib/api-error'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(['chef', 'admin'])
    const restaurantId = new ObjectId(user.restaurantId)

    const kitchenCollection = await getCollection('kitchenItems')
    const items = await kitchenCollection
      .find({
        restaurantId,
        status: { $ne: 'served' },
      })
      .sort({ createdAt: 1 })
      .toArray()

    return NextResponse.json(items)
  } catch (error) {
    return handleAPIError(error)
  }
}
