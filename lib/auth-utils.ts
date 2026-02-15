import { auth } from './auth'
import { getCollection } from './db'
import { User } from './types'
import { ObjectId } from 'mongodb'

export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.email) {
    return null
  }

  const usersCollection = await getCollection('users')
  const user = (await usersCollection.findOne({
    email: session.user.email,
  })) as User | null

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden')
  }
  return user
}

export async function requireRestaurant(restaurantId: string) {
  const user = await requireAuth()
  if (
    !user.restaurantId ||
    user.restaurantId.toString() !== restaurantId
  ) {
    throw new Error('Forbidden')
  }
  return user
}
