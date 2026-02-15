import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-utils'
import { getCollection } from '@/lib/db'
import { handleAPIError, APIError } from '@/lib/api-error'
import { ObjectId } from 'mongodb'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(['chef', 'admin'])
    const body = await request.json()
    const { status } = body

    const itemId = new ObjectId(params.id)
    const restaurantId = new ObjectId(user.restaurantId)

    const kitchenCollection = await getCollection('kitchenItems')
    const item = await kitchenCollection.findOne({
      _id: itemId,
      restaurantId,
    })

    if (!item) {
      throw new APIError(404, 'Kitchen item not found')
    }

    const updateData: any = {
      status,
    }

    if (status === 'cooking' && !item.prepStartedAt) {
      updateData.prepStartedAt = new Date()
    }

    if (status === 'ready') {
      updateData.readyAt = new Date()
    }

    const result = await kitchenCollection.updateOne(
      { _id: itemId },
      { $set: updateData }
    )

    if (result.modifiedCount === 0) {
      throw new APIError(500, 'Failed to update kitchen item')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAPIError(error)
  }
}
