
import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import RoleRoute from './components/RoleRoute'
import CartPage from './pages/CartPage'
import CustomerProfilePage from './pages/CustomerProfilePage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductListPage from './pages/ProductListPage'
import RegisterPage from './pages/RegisterPage'
import SearchNotFoundPage from './pages/SearchNotFoundPage'
import FavoritePage from './pages/FavoritePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentPage from './pages/PaymentPage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import ContactPage from './pages/ContactPage'
import StaffDashboard from './pages/StaffDashboard'
import AdminDashboard from './pages/AdminDashboard'

function ProductListRoute() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.search])

  return <ProductListPage key={location.search} />
}

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListRoute />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/search-not-found" element={<SearchNotFoundPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<CustomerProfilePage />} />
        <Route path="/favorites" element={<FavoritePage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/order-tracking" element={<OrderTrackingPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/staff" element={<RoleRoute allow={['STAFF', 'ADMIN']}><StaffDashboard /></RoleRoute>} />
        <Route path="/admin" element={<RoleRoute allow={['ADMIN']}><AdminDashboard /></RoleRoute>} />
      </Route>
    </Routes>
  )
}

export default App
