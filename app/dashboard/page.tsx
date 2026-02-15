'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChefHat, TrendingUp, Clock, DollarSign } from 'lucide-react'

interface Order {
  _id: string
  orderId: string
  tableNumber: number
  status: string
  totalPrice: number
  createdAt: string
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    cookingOrders: 0,
    readyOrders: 0,
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)

        // Calculate stats
        const cooking = data.filter((o: Order) => o.status === 'cooking').length
        const ready = data.filter((o: Order) => o.status === 'ready').length
        const revenue = data.reduce((sum: number, o: Order) => sum + (o.totalPrice || 0), 0)

        setStats({
          totalOrders: data.length,
          totalRevenue: revenue,
          cookingOrders: cooking,
          readyOrders: ready,
        })
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      cooking: 'bg-orange-100 text-orange-800',
      ready: 'bg-green-100 text-green-800',
      served: 'bg-gray-100 text-gray-800',
      completed: 'bg-gray-200 text-gray-900',
    }
    return colors[status] || 'bg-gray-100'
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's your restaurant overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.totalOrders}</p>
            </div>
            <UtensilsCrossed className="w-10 h-10 text-primary" />
          </div>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Revenue</p>
              <p className="text-3xl font-bold text-foreground mt-2">${stats.totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500" />
          </div>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Cooking</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.cookingOrders}</p>
            </div>
            <ChefHat className="w-10 h-10 text-accent" />
          </div>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Ready</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.readyOrders}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="bg-card border border-border overflow-hidden">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-secondary border-b border-border rounded-none w-full justify-start h-auto p-0">
            <TabsTrigger value="all" className="rounded-none border-r border-border">
              All Orders
            </TabsTrigger>
            <TabsTrigger value="cooking" className="rounded-none border-r border-border">
              Cooking
            </TabsTrigger>
            <TabsTrigger value="ready" className="rounded-none">
              Ready
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="p-6 space-y-4">
            {orders.length === 0 ? (
              <p className="text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Table</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b border-border hover:bg-secondary transition">
                        <td className="py-3 px-4 text-foreground">{order.orderId}</td>
                        <td className="py-3 px-4 text-foreground">Table {order.tableNumber}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-foreground">${order.totalPrice.toFixed(2)}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cooking" className="p-6">
            <div className="space-y-4">
              {orders.filter((o) => o.status === 'cooking').length === 0 ? (
                <p className="text-muted-foreground">No orders currently cooking.</p>
              ) : (
                orders
                  .filter((o) => o.status === 'cooking')
                  .map((order) => (
                    <Card key={order._id} className="p-4 bg-secondary border border-border flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-foreground">{order.orderId}</p>
                        <p className="text-sm text-muted-foreground">Table {order.tableNumber}</p>
                      </div>
                      <p className="text-lg font-bold text-primary">${order.totalPrice.toFixed(2)}</p>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="ready" className="p-6">
            <div className="space-y-4">
              {orders.filter((o) => o.status === 'ready').length === 0 ? (
                <p className="text-muted-foreground">No ready orders.</p>
              ) : (
                orders
                  .filter((o) => o.status === 'ready')
                  .map((order) => (
                    <Card key={order._id} className="p-4 bg-secondary border border-border flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-foreground">{order.orderId}</p>
                        <p className="text-sm text-muted-foreground">Table {order.tableNumber}</p>
                      </div>
                      <p className="text-lg font-bold text-green-500">${order.totalPrice.toFixed(2)}</p>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

import { UtensilsCrossed } from 'lucide-react'
