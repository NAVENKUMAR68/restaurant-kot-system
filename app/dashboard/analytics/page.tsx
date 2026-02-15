'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, DollarSign, Clock, Zap } from 'lucide-react'

interface Order {
  _id: string
  totalPrice: number
  createdAt: string
  status: string
  items: any[]
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    avgPrepTime: 0,
  })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)

        // Calculate stats
        const totalRevenue = data.reduce((sum: number, o: Order) => sum + (o.totalPrice || 0), 0)
        const totalOrders = data.length
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

        setStats({
          totalRevenue,
          totalOrders,
          avgOrderValue,
          avgPrepTime: 15, // placeholder
        })
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHourlyOrders = () => {
    const hourlyData: Record<string, number> = {}

    orders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours()
      const key = `${hour}:00`
      hourlyData[key] = (hourlyData[key] || 0) + 1
    })

    return Object.entries(hourlyData)
      .map(([time, count]) => ({ time, orders: count }))
      .sort((a, b) => parseInt(a.time) - parseInt(b.time))
  }

  const getRevenueTrend = () => {
    const dailyData: Record<string, number> = {}

    orders.forEach((order) => {
      const date = new Date(order.createdAt).toLocaleDateString()
      dailyData[date] = (dailyData[date] || 0) + order.totalPrice
    })

    return Object.entries(dailyData)
      .map(([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 }))
      .slice(-7)
  }

  const getOrdersByStatus = () => {
    const statusData: Record<string, number> = {}

    orders.forEach((order) => {
      statusData[order.status] = (statusData[order.status] || 0) + 1
    })

    return Object.entries(statusData).map(([status, count]) => ({
      name: status,
      value: count,
    }))
  }

  const getTopItems = () => {
    const itemData: Record<string, number> = {}

    orders.forEach((order) => {
      order.items.forEach((item: any) => {
        itemData[item.name] = (itemData[item.name] || 0) + item.quantity
      })
    })

    return Object.entries(itemData)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6)
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    )
  }

  const hourlyOrders = getHourlyOrders()
  const revenueTrend = getRevenueTrend()
  const ordersByStatus = getOrdersByStatus()
  const topItems = getTopItems()

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-2">Monitor your restaurant performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                ${stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500" />
          </div>
        </Card>

        <Card className="bg-card border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.totalOrders}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-500" />
          </div>
        </Card>

        <Card className="bg-card border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Avg Order Value</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                ${stats.avgOrderValue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-500" />
          </div>
        </Card>

        <Card className="bg-card border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Avg Prep Time</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.avgPrepTime}m</p>
            </div>
            <Clock className="w-10 h-10 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="bg-card border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Hourly Orders */}
        <Card className="bg-card border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Orders by Hour</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyOrders}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Bar dataKey="orders" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Orders by Status */}
        <Card className="bg-card border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ordersByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="value"
              >
                {ordersByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Items */}
        <Card className="bg-card border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Items</h3>
          <div className="space-y-4">
            {topItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between pb-4 border-b border-border last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.name}</p>
                  <div className="w-full bg-secondary rounded-full h-2 mt-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${(item.quantity / (topItems[0]?.quantity || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <span className="ml-4 font-bold text-primary">{item.quantity}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
