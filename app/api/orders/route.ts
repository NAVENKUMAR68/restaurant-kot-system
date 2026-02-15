import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { getCollection } from '@/lib/db'
import { handleAPIError, APIError } from '@/lib/api-error'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const restaurantId = new ObjectId(user.restaurantId)

    const ordersCollection = await getCollection('orders')
    const orders = await ordersCollection
      .find({ restaurantId })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(orders)
  } catch (error) {
    return handleAPIError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const {
      tableNumber,
      items,
      specialInstructions,
    } = body

    if (!tableNumber || !items || items.length === 0) {
      throw new APIError(400, 'Missing required fields')
    }

    const restaurantId = new ObjectId(user.restaurantId)
    const ordersCollection = await getCollection('orders')
    
    const totalPrice = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    )

    const orderId = `ORD-${Date.now()}`

    const result = await ordersCollection.insertOne({
      restaurantId,
      orderId,
      tableNumber,
      items,
      status: 'pending',
      totalPrice,
      specialInstructions,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Create kitchen items
    const kitchenCollection = await getCollection('kitchenItems')
    for (const item of items) {
      await kitchenCollection.insertOne({
        orderId: result.insertedId,
        restaurantId,
        itemName: item.name,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
        status: 'pending',
        createdAt: new Date(),
        tableNumber,
      })
    }

    return NextResponse.json(
      {
        _id: result.insertedId,
        orderId,
        status: 'pending',
      },
      { status: 201 }
    )
  } catch (error) {
    return handleAPIError(error)
  }
}
