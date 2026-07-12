import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import CartProvider from './context/CartProvider.jsx'
import AuthProvider from './context/AuthProvider.jsx'
import FavoriteProvider from './context/FavoriteProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FavoriteProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </FavoriteProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
