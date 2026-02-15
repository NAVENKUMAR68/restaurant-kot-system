import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'
import bcryptjs from 'bcryptjs'
import { ObjectId } from 'mongodb'
import { handleAPIError, APIError } from '@/lib/api-error'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      name,
      role,
      restaurantName,
      restaurantAddress,
      restaurantPhone,
    } = body

    if (!email || !password || !name || !role) {
      throw new APIError(400, 'Missing required fields')
    }

    const usersCollection = await getCollection('users')
    const existingUser = await usersCollection.findOne({ email })

    if (existingUser) {
      throw new APIError(400, 'User already exists')
    }

    const hashedPassword = await bcryptjs.hash(password, 10)
    let restaurantId = undefined

    if (role === 'admin' && restaurantName) {
      const restaurantsCollection = await getCollection('restaurants')
      const restaurant = await restaurantsCollection.insertOne({
        name: restaurantName,
        address: restaurantAddress || '',
        phone: restaurantPhone || '',
        email: email,
        tables: 10,
        operatingHours: { open: '09:00', close: '23:00' },
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      restaurantId = restaurant.insertedId
    }

    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
      name,
      role,
      restaurantId,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json(
      {
        message: 'User registered successfully',
        userId: result.insertedId,
      },
      { status: 201 }
    )
  } catch (error) {
    return handleAPIError(error)
  }
}
