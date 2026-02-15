import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import { connectToDatabase, getCollection } from './db'
import bcryptjs from 'bcryptjs'
import { User } from './types'
import { MongoClient } from 'mongodb'

let mongoClient: MongoClient | null = null

async function getMongoClient(): Promise<MongoClient> {
  if (!mongoClient) {
    const { client } = await connectToDatabase()
    mongoClient = client
  }
  return mongoClient
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(getMongoClient()),
  secret: process.env.NEXTAUTH_SECRET || 'smartkot_secret_123',
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          return null
        }

        const usersCollection = await getCollection('users')
        const user = (await usersCollection.findOne({
          email: credentials.email,
        })) as User | null

        if (!user) {
          return null
        }

        const isPasswordValid = await bcryptjs.compare(
          credentials.password as string,
          user.password || ''
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user._id?.toString(),
          email: user.email,
          name: user.name,
          image: null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        const usersCollection = await getCollection('users')
        const userData = (await usersCollection.findOne({
          email: session.user.email,
        })) as User | null
        if (userData) {
          session.user.role = userData.role
          session.user.restaurantId = userData.restaurantId?.toString()
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
