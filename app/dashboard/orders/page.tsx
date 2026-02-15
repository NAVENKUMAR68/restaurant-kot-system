'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, RefreshCw } from 'lucide-react'
import { CreateOrderDialog } from '@/components/orders/create-order-dialog'

interface Order {
  _id: string
  orderId: string
  tableNumber: number
  status: string
  totalPrice: number
  createdAt: string
  items: any[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === statusFilter)

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-600',
      confirmed: 'bg-blue-500/10 border-blue-500/50 text-blue-600',
      cooking: 'bg-orange-500/10 border-orange-500/50 text-orange-600',
      ready: 'bg-green-500/10 border-green-500/50 text-green-600',
      served: 'bg-gray-500/10 border-gray-500/50 text-gray-600',
      completed: 'bg-gray-500/10 border-gray-500/50 text-gray-600',
    }
    return colors[status] || 'bg-gray-500/10'
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-2">Manage all restaurant orders</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchOrders} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border border-border p-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cooking">Cooking</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-muted-foreground col-span-full">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-muted-foreground col-span-full">No orders found.</p>
        ) : (
          filteredOrders.map((order) => (
            <Card
              key={order._id}
              className={`border-2 p-6 cursor-pointer transition hover:shadow-lg ${getStatusColor(order.status)}`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-lg">{order.orderId}</p>
                    <p className="text-sm text-muted-foreground">Table {order.tableNumber}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="space-y-2 py-4 border-t border-border/50">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-foreground">{item.quantity}x {item.name}</span>
                      <span className="text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border/50">
                  <span className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </span>
                  <span className="text-lg font-bold text-primary">${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Order Dialog */}
      <CreateOrderDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={fetchOrders} />
    </div>
  )
}
