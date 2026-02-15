import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { getCollection } from '@/lib/db'
import { handleAPIError, APIError } from '@/lib/api-error'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const orderId = new ObjectId(params.id)

    const ordersCollection = await getCollection('orders')
    const order = await ordersCollection.findOne({
      _id: orderId,
      restaurantId: new ObjectId(user.restaurantId),
    })

    if (!order) {
      throw new APIError(404, 'Order not found')
    }

    return NextResponse.json(order)
  } catch (error) {
    return handleAPIError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { status, items } = body

    const orderId = new ObjectId(params.id)
    const restaurantId = new ObjectId(user.restaurantId)

    const ordersCollection = await getCollection('orders')
    const order = await ordersCollection.findOne({
      _id: orderId,
      restaurantId,
    })

    if (!order) {
      throw new APIError(404, 'Order not found')
    }

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (status) {
      updateData.status = status
      if (status === 'cooking') {
        updateData.preparationStartedAt = new Date()
      } else if (status === 'ready') {
        updateData.readyAt = new Date()
      } else if (status === 'completed') {
        updateData.completedAt = new Date()
      }
    }

    if (items) {
      updateData.items = items
    }

    const result = await ordersCollection.updateOne(
      { _id: orderId },
      { $set: updateData }
    )

    if (result.modifiedCount === 0) {
      throw new APIError(500, 'Failed to update order')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAPIError(error)
  }
}
