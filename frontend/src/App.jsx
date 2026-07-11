
import { Route, Routes, useLocation } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import CartPage from './pages/CartPage'
import CustomerProfilePage from './pages/CustomerProfilePage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductListPage from './pages/ProductListPage'
import RegisterPage from './pages/RegisterPage'

function ProductListRoute() {
  const location = useLocation()
  return <ProductListPage key={location.search} />
}

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListRoute />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<CustomerProfilePage />} />
      </Route>
    </Routes>
  )
}

export default App
