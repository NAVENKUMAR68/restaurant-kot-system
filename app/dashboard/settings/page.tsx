'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Settings, Save } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    restaurantName: 'My Restaurant',
    email: 'restaurant@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, City, State 12345',
    operatingHours: {
      open: '09:00',
      close: '23:00',
    },
  })

  const [saved, setSaved] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [name]: value,
      },
    }))
  }

  const handleSave = async () => {
    try {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your restaurant settings</p>
      </div>

      {/* Restaurant Settings */}
      <Card className="bg-card border border-border p-8 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Restaurant Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Restaurant Name
            </label>
            <Input
              name="restaurantName"
              value={settings.restaurantName}
              onChange={handleChange}
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <Input
              name="email"
              type="email"
              value={settings.email}
              onChange={handleChange}
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Phone
            </label>
            <Input
              name="phone"
              value={settings.phone}
              onChange={handleChange}
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Address
            </label>
            <Input
              name="address"
              value={settings.address}
              onChange={handleChange}
              className="bg-secondary border-border text-foreground"
            />
          </div>
        </div>

        {/* Operating Hours */}
        <div className="border-t border-border pt-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Operating Hours</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Opening Time
              </label>
              <Input
                name="open"
                type="time"
                value={settings.operatingHours.open}
                onChange={handleHoursChange}
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Closing Time
              </label>
              <Input
                name="close"
                type="time"
                value={settings.operatingHours.close}
                onChange={handleHoursChange}
                className="bg-secondary border-border text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          {saved && (
            <p className="text-green-600 font-medium">Settings saved successfully!</p>
          )}
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-destructive/5 border border-destructive/30 p-8 space-y-4">
        <h3 className="text-lg font-bold text-destructive">Danger Zone</h3>
        <p className="text-destructive/80">
          These actions cannot be undone. Please be careful.
        </p>
        <Button variant="destructive">
          Delete Restaurant Account
        </Button>
      </Card>
    </div>
  )
}
