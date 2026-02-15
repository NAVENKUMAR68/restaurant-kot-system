'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, Minus } from 'lucide-react'

interface MenuItem {
  _id: string
  name: string
  price: number
  category: string
}

interface OrderItem {
  menuItemId: string
  name: string
  quantity: number
  price: number
}

interface CreateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const SAMPLE_MENU: MenuItem[] = [
  { _id: '1', name: 'Biryani', price: 12.99, category: 'Mains' },
  { _id: '2', name: 'Butter Chicken', price: 14.99, category: 'Mains' },
  { _id: '3', name: 'Paneer Tikka', price: 11.99, category: 'Appetizers' },
  { _id: '4', name: 'Garlic Naan', price: 3.99, category: 'Breads' },
  { _id: '5', name: 'Lassi', price: 4.99, category: 'Beverages' },
]

export function CreateOrderDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateOrderDialogProps) {
  const [tableNumber, setTableNumber] = useState('')
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(false)

  const addItem = (menuItem: MenuItem) => {
    const existingItem = items.find((i) => i.menuItemId === menuItem._id)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      items.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        quantity: 1,
        price: menuItem.price,
      })
    }
    setItems([...items])
  }

  const removeItem = (menuItemId: string) => {
    setItems(items.filter((i) => i.menuItemId !== menuItemId))
  }

  const updateQuantity = (menuItemId: string, quantity: number) => {
    const item = items.find((i) => i.menuItemId === menuItemId)
    if (item) {
      if (quantity <= 0) {
        removeItem(menuItemId)
      } else {
        item.quantity = quantity
        setItems([...items])
      }
    }
  }

  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const handleSubmit = async () => {
    if (!tableNumber || items.length === 0) {
      alert('Please select a table and add items')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: parseInt(tableNumber),
          items,
        }),
      })

      if (response.ok) {
        setTableNumber('')
        setItems([])
        onOpenChange(false)
        onSuccess()
      }
    } catch (error) {
      console.error('Failed to create order:', error)
      alert('Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create New Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Table Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Table Number
            </label>
            <Input
              type="number"
              min="1"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Enter table number"
              className="bg-secondary border-border text-foreground"
            />
          </div>

          {/* Menu Items */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Select Items
            </label>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {SAMPLE_MENU.map((menuItem) => (
                <Card
                  key={menuItem._id}
                  className="bg-secondary border-border p-3 cursor-pointer hover:border-primary transition"
                  onClick={() => addItem(menuItem)}
                >
                  <p className="font-medium text-foreground text-sm">{menuItem.name}</p>
                  <p className="text-primary font-bold text-sm">${menuItem.price}</p>
                  <p className="text-muted-foreground text-xs mt-1">{menuItem.category}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          {items.length > 0 && (
            <div className="space-y-3 bg-secondary border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground">Order Summary</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.menuItemId} className="flex items-center justify-between">
                    <span className="text-foreground">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-foreground font-medium w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <span className="text-primary font-semibold w-16 text-right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="font-semibold text-foreground">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !tableNumber || items.length === 0}
            >
              {loading ? 'Creating...' : 'Create Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
