# SmartKOT - Kitchen Order Tracking System

A modern, full-featured Kitchen Order Tracking (KOT) system built with Next.js, MongoDB, and TypeScript.

## Features

- **User Authentication**: Secure login/registration with NextAuth
- **Role-Based Access Control**: Admin, Manager, and Chef roles
- **Restaurant Dashboard**: Overview of orders, revenue, and operations
- **Order Management**: Create, track, and manage orders
- **Kitchen Display System**: Real-time order display for kitchen staff
- **Analytics Dashboard**: Revenue trends, order metrics, and performance insights
- **Settings Management**: Configure restaurant details and operating hours

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: NextAuth 5
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- npm or pnpm

### Installation

1. Clone the repository and install dependencies:
```bash
pnpm install
```

2. Set up environment variables in `.env.local`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartkot
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
app/
├── api/                    # API Routes
│   ├── auth/              # Authentication endpoints
│   ├── orders/            # Order management
│   ├── kitchen/           # Kitchen display endpoints
│   └── menu/              # Menu management
├── login/                 # Login page
├── register/              # Registration page
├── dashboard/             # Admin dashboard
│   ├── orders/           # Orders management
│   ├── analytics/        # Analytics dashboard
│   └── settings/         # Settings page
└── kitchen/              # Kitchen display system

components/
├── dashboard/            # Dashboard components
├── orders/              # Order components
└── ui/                  # shadcn UI components

lib/
├── db.ts               # MongoDB connection
├── types.ts            # TypeScript types
├── auth.ts             # NextAuth configuration
├── auth-utils.ts       # Authentication utilities
└── api-error.ts        # Error handling
```

## User Roles

### Admin
- Full system access
- Create and manage users
- View analytics and reports
- Configure restaurant settings
- Manage menu items

### Manager
- View orders and analytics
- Manage staff
- Generate reports
- Monitor KOT system

### Chef
- Access Kitchen Display System
- View pending orders
- Update order status (cooking, ready)
- Manage special instructions

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth callbacks

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get specific order
- `PATCH /api/orders/[id]` - Update order status

### Kitchen
- `GET /api/kitchen/items` - Get kitchen items
- `PATCH /api/kitchen/items/[id]` - Update item status

### Menu
- `GET /api/menu` - Get menu items
- `POST /api/menu` - Create menu item

## Database Models

### User
```typescript
{
  email: string
  password: string (hashed)
  name: string
  role: 'admin' | 'manager' | 'chef'
  restaurantId: ObjectId
  active: boolean
}
```

### Order
```typescript
{
  restaurantId: ObjectId
  orderId: string
  tableNumber: number
  items: OrderItem[]
  status: 'pending' | 'confirmed' | 'cooking' | 'ready' | 'served' | 'completed'
  totalPrice: number
  specialInstructions?: string
}
```

### KitchenItem
```typescript
{
  orderId: ObjectId
  restaurantId: ObjectId
  itemName: string
  quantity: number
  status: 'pending' | 'cooking' | 'ready'
  tableNumber: number
}
```

## Security

- Passwords are hashed with bcryptjs
- NextAuth handles session management
- API routes are protected with authentication middleware
- Environment variables for sensitive data
- HTTP-only cookies for session storage

## Performance

- Real-time polling for order updates (5-second intervals)
- Server-side data fetching where possible
- Optimized database queries with indexes
- Responsive design for mobile and desktop

## Customization

### Adding Menu Items
Menu items can be managed through the API or admin dashboard. Items include:
- Name, category, description
- Price and preparation time
- Active/inactive status

### Configuring Roles
Modify user roles in registration or through admin panel. Add new roles by:
1. Updating the `User` type in `lib/types.ts`
2. Adding role checks in `lib/auth-utils.ts`
3. Creating role-specific components/routes

## Troubleshooting

### MongoDB Connection Issues
- Verify `MONGODB_URI` in `.env.local`
- Check network access in MongoDB Atlas
- Ensure database name is correct

### Authentication Errors
- Clear browser cookies and cache
- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches deployment URL

### Real-time Updates Not Working
- Check browser console for errors
- Verify API endpoints are returning data
- Check MongoDB connection status

## Future Enhancements

- WebSocket support for real-time updates
- Advanced analytics and reporting
- Multi-restaurant support
- Table management and seating charts
- Customer feedback system
- Payment integration
- SMS/Email notifications
- Mobile app for chefs

## License

This project is created with v0.app and is open for modification and deployment.
