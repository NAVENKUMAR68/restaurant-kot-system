import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { getCollection } from '@/lib/db'
import { handleAPIError, APIError } from '@/lib/api-error'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const restaurantId = new ObjectId(user.restaurantId)

    const menuCollection = await getCollection('menuItems')
    const items = await menuCollection
      .find({ restaurantId, active: true })
      .toArray()

    return NextResponse.json(items)
  } catch (error) {
    return handleAPIError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { name, category, description, price, preparationTime } = body

    if (!name || !category || !price) {
      throw new APIError(400, 'Missing required fields')
    }

    const restaurantId = new ObjectId(user.restaurantId)
    const menuCollection = await getCollection('menuItems')

    const result = await menuCollection.insertOne({
      restaurantId,
      name,
      category,
      description,
      price,
      preparationTime: preparationTime || 15,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json(
      { _id: result.insertedId },
      { status: 201 }
    )
  } catch (error) {
    return handleAPIError(error)
  }
}
