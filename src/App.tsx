import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Customer from '@/pages/Customer'
import Kitchen from '@/pages/Kitchen'
import Admin from '@/pages/Admin'
import ThankYou from '@/pages/ThankYou'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/customer" element={<Customer />} />
        <Route path="/thankyou" element={<ThankYou />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['kitchen']} />}>
          <Route path="/kitchen" element={<Kitchen />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="/" element={<Navigate to="/customer" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
