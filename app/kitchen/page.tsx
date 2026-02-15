'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock } from 'lucide-react'

interface KitchenItem {
  _id: string
  orderId: string
  itemName: string
  quantity: number
  specialInstructions?: string
  status: 'pending' | 'cooking' | 'ready'
  tableNumber: number
  createdAt: string
  prepStartedAt?: string
}

const COLORS = {
  pending: 'bg-yellow-500',
  cooking: 'bg-orange-500',
  ready: 'bg-green-500',
}

const TEXT_COLORS = {
  pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  cooking: 'text-orange-600 bg-orange-50 border-orange-200',
  ready: 'text-green-600 bg-green-50 border-green-200',
}

export default function KitchenPage() {
  const [items, setItems] = useState<KitchenItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchKitchenItems()
    const interval = setInterval(fetchKitchenItems, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchKitchenItems = async () => {
    try {
      const response = await fetch('/api/kitchen/items')
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Failed to fetch kitchen items:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateItemStatus = async (itemId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/kitchen/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchKitchenItems()
      }
    } catch (error) {
      console.error('Failed to update item status:', error)
    }
  }

  const pendingItems = items.filter((i) => i.status === 'pending')
  const cookingItems = items.filter((i) => i.status === 'cooking')
  const readyItems = items.filter((i) => i.status === 'ready')

  const KitchenItemCard = ({ item, status }: { item: KitchenItem; status: 'pending' | 'cooking' | 'ready' }) => {
    const getTimeElapsed = () => {
      const createdTime = new Date(item.createdAt).getTime()
      const now = new Date().getTime()
      const diffMs = now - createdTime
      const diffMins = Math.floor(diffMs / 60000)
      return diffMins > 0 ? `${diffMins}m ago` : 'Just now'
    }

    return (
      <Card
        className={`p-6 border-2 relative overflow-hidden ${
          status === 'pending' ? 'border-yellow-500 bg-yellow-50' :
          status === 'cooking' ? 'border-orange-500 bg-orange-50' :
          'border-green-500 bg-green-50'
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

        <div className="space-y-4 pt-2">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-lg font-bold text-foreground">Table {item.tableNumber}</p>
              <p className="text-sm text-muted-foreground">{getTimeElapsed()}</p>
            </div>
            <Badge className={`text-xs font-bold uppercase ${
              status === 'pending' ? 'bg-yellow-500' :
              status === 'cooking' ? 'bg-orange-500' :
              'bg-green-500'
            }`}>
              {status}
            </Badge>
          </div>

          {/* Item Details */}
          <div className="bg-white/50 rounded p-4">
            <p className="text-xl font-bold text-foreground mb-1">{item.itemName}</p>
            <p className="text-2xl font-bold text-primary">Qty: {item.quantity}</p>
            {item.specialInstructions && (
              <div className="mt-3 pt-3 border-t border-gray-300">
                <p className="text-sm font-medium text-foreground">Special Instructions:</p>
                <p className="text-sm text-muted-foreground mt-1">{item.specialInstructions}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {status === 'pending' && (
              <Button
                onClick={() => updateItemStatus(item._id, 'cooking')}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Clock className="w-4 h-4 mr-2" />
                Start Cooking
              </Button>
            )}
            {status === 'cooking' && (
              <Button
                onClick={() => updateItemStatus(item._id, 'ready')}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Ready
              </Button>
            )}
          </div>
        </div>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-foreground text-xl">Loading kitchen display...</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Kitchen Display System</h1>
        <p className="text-muted-foreground">Manage and track all orders in real-time</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="bg-yellow-50 border-yellow-200 p-4">
          <p className="text-yellow-600 text-sm font-semibold">PENDING</p>
          <p className="text-4xl font-bold text-yellow-700 mt-2">{pendingItems.length}</p>
        </Card>
        <Card className="bg-orange-50 border-orange-200 p-4">
          <p className="text-orange-600 text-sm font-semibold">COOKING</p>
          <p className="text-4xl font-bold text-orange-700 mt-2">{cookingItems.length}</p>
        </Card>
        <Card className="bg-green-50 border-green-200 p-4">
          <p className="text-green-600 text-sm font-semibold">READY</p>
          <p className="text-4xl font-bold text-green-700 mt-2">{readyItems.length}</p>
        </Card>
      </div>

      {/* Kitchen Items Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Column */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground mb-4">Pending</h2>
          {pendingItems.length === 0 ? (
            <Card className="bg-card border-border p-8 text-center">
              <p className="text-muted-foreground">No pending items</p>
            </Card>
          ) : (
            pendingItems.map((item) => (
              <KitchenItemCard key={item._id} item={item} status="pending" />
            ))
          )}
        </div>

        {/* Cooking Column */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground mb-4">Cooking</h2>
          {cookingItems.length === 0 ? (
            <Card className="bg-card border-border p-8 text-center">
              <p className="text-muted-foreground">No items cooking</p>
            </Card>
          ) : (
            cookingItems.map((item) => (
              <KitchenItemCard key={item._id} item={item} status="cooking" />
            ))
          )}
        </div>

        {/* Ready Column */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ready</h2>
          {readyItems.length === 0 ? (
            <Card className="bg-card border-border p-8 text-center">
              <p className="text-muted-foreground">No ready items</p>
            </Card>
          ) : (
            readyItems.map((item) => (
              <KitchenItemCard key={item._id} item={item} status="ready" />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
