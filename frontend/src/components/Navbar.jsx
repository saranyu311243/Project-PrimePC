import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { MdArrowDropDown, MdFavoriteBorder, MdHome, MdLogout, MdOutlinePerson, MdOutlineSearch, MdOutlineShoppingCart, MdContactSupport, MdHistory, MdDashboard, MdAdminPanelSettings } from 'react-icons/md'
import { categories } from '../data/categories'
import { homeBrandOptions } from '../data/productListConfig'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { useFavorites } from '../hooks/useFavorites'
import { useProducts } from '../hooks/useProducts'

const categorySearchAliases = {
  cpu: ['cpu', 'processor', 'ซีพียู', 'หน่วยประมวลผล'],
  motherboard: ['mainboard', 'motherboard', 'mb', 'เมนบอร์ด'],
  gpu: ['gpu', 'vga', 'graphic card', 'graphics card', 'การ์ดจอ'],
  ram: ['ram', 'memory', 'แรม'],
  storage: ['storage', 'ssd', 'hdd', 'harddisk', 'hard drive', 'ฮาร์ดดิสก์', 'เอสเอสดี'],
  psu: ['psu', 'power supply', 'พาวเวอร์ซัพพลาย'],
  cooling: ['cooling', 'cooler', 'fan', 'ชุดระบายความร้อน', 'พัดลม'],
  notebook: ['notebook', 'laptop', 'โน้ตบุ๊ก', 'แล็ปท็อป'],
  monitor: ['monitor', 'display', 'จอคอม', 'จอมอนิเตอร์'],
  keyboard: ['keyboard', 'คีย์บอร์ด'],
  mouse: ['mouse', 'เมาส์'],
  accessory: ['accessory', 'accessories', 'อุปกรณ์เสริม', 'ไมค์', 'ไมโครโฟน', 'webcam'],
  case: ['case', 'computer case', 'เคส'],
  headset: ['headset', 'headphone', 'หูฟัง'],
}

function Navbar() {
  const navigate = useNavigate()
  const { itemCount, clearCart } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const { clearFavorites } = useFavorites()
  const { products } = useProducts()
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('home')
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const handleLogout = () => {
    clearCart()
    clearFavorites()
    logout()
    setAccountMenuOpen(false)
    navigate('/')
  }

  const handleSearch = (event) => {
    event.preventDefault()
    const normalizedSearch = searchText.trim().toLowerCase()

    if (!normalizedSearch && selectedCategory === 'home') {
      navigate('/')
      return
    }

    const searchTokens = normalizedSearch.split(/\s+/).filter(Boolean)
    const matchingProduct = normalizedSearch ? products.find((product) => {
      if (!homeBrandOptions.includes(product.brand?.toUpperCase())) return false
      const haystack = [
        product.name,
        product.brand,
        product.description,
        product.categoryName,
        product.icon,
        ...(categorySearchAliases[product.category] ?? []),
      ].join(' ').toLowerCase()

      return searchTokens.every((token) => haystack.includes(token))
    }) : null
    const categoryFromAlias = normalizedSearch ? Object.entries(categorySearchAliases).find(([, aliases]) =>
      aliases.some((alias) => normalizedSearch.includes(alias.toLowerCase())),
    )?.[0] : null
    const targetCategory = selectedCategory === 'home'
      ? matchingProduct?.category || categoryFromAlias || 'cpu'
      : selectedCategory
    const hasMatchingProduct = !normalizedSearch || products.some((product) => {
      if (product.category !== targetCategory) return false
      if (!homeBrandOptions.includes(product.brand?.toUpperCase())) return false
      const haystack = [
        product.name,
        product.brand,
        product.description,
        product.categoryName,
        product.icon,
        ...(categorySearchAliases[product.category] ?? []),
      ].join(' ').toLowerCase()
      return searchTokens.every((token) => haystack.includes(token))
    })

    if (!hasMatchingProduct) {
      navigate(`/search-not-found?search=${encodeURIComponent(normalizedSearch)}`)
      return
    }

    const params = new URLSearchParams({ category: targetCategory })

    if (normalizedSearch) params.set('search', normalizedSearch)
    navigate(`/products?${params.toString()}`)
  }

  return (
    <header className="sticky top-0 z-50 bg-blue-800 text-white shadow-md">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:flex-nowrap lg:gap-5 lg:px-8">
        <NavLink to="/" className="shrink-0 text-2xl font-black italic tracking-tighter sm:text-3xl" aria-label="PrimePC หน้าแรก">
          PRIME<span className="text-sky-300">PC</span>
        </NavLink>

        <form onSubmit={handleSearch} className="order-3 flex w-full overflow-hidden rounded-sm bg-white text-slate-800 lg:order-none lg:flex-1" role="search">
          <label className="sr-only" htmlFor="product-search">ค้นหาสินค้า</label>
          <input
            id="product-search"
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="ค้นหาสินค้าอะไรดี ?"
            className="min-w-0 flex-1 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400"
          />
          <select
            aria-label="เลือกหมวดหมู่สินค้า"
            className="hidden border-l border-slate-200 bg-slate-50 px-3 text-xs outline-none md:block"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="home">หมวดหมู่สินค้า</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button type="submit" className="grid w-12 place-items-center bg-sky-500 text-white transition hover:bg-sky-600" aria-label="ค้นหา">
            <MdOutlineSearch className="h-6 w-6" aria-hidden="true" />
          </button>
        </form>

        <div className="relative ml-auto flex shrink-0 items-center gap-3 sm:gap-5">
          <Link to="/contact" className="hidden items-center gap-2 text-white hover:text-sky-200 sm:flex">
            <MdContactSupport className="h-6 w-6" aria-hidden="true" />
            <span className="hidden text-xs font-semibold sm:inline">ติดต่อ</span>
          </Link>

          <Link to="/cart" className="relative flex items-center gap-2 text-white hover:text-sky-200">
            <span className="relative">
              <MdOutlineShoppingCart className="h-6 w-6" aria-hidden="true" />
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-sky-400 px-1 text-[10px] font-bold text-blue-950">{itemCount}</span>
            </span>
            <span className="hidden text-xs font-semibold sm:inline">ตะกร้าสินค้า</span>
          </Link>

          {isAuthenticated ? (
            <div className="relative">
              <button type="button" onClick={() => setAccountMenuOpen((value) => !value)} className="flex items-center gap-1 border-l border-blue-600 pl-3 text-white hover:text-sky-200 sm:pl-5" aria-expanded={accountMenuOpen}>
                <MdOutlinePerson className="h-6 w-6" aria-hidden="true" />
                <span className="hidden max-w-28 truncate text-xs font-semibold sm:inline">{user?.firstName || user?.email?.split('@')[0]}</span>
                <MdArrowDropDown className={`h-5 w-5 transition ${accountMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {accountMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-4 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xl">
                  <p className="truncate border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold">{user?.email}</p>
                  <div className="p-2 text-sm">
                    <Link to="/" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-blue-50 hover:text-blue-700"><MdHome className="h-5 w-5" />หน้าหลัก</Link>
                    <Link to="/orders" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-blue-50 hover:text-blue-700"><MdHistory className="h-5 w-5" />ประวัติคำสั่งซื้อ</Link>
                    <Link to="/order-tracking" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-blue-50 hover:text-blue-700"><MdOutlineSearch className="h-5 w-5" />ติดตามพัสดุ</Link>
                    <Link to="/profile" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-blue-50 hover:text-blue-700"><MdOutlinePerson className="h-5 w-5" />ข้อมูลส่วนตัว</Link>
                    <Link to="/favorites" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-blue-50 hover:text-blue-700"><MdFavoriteBorder className="h-5 w-5" />สินค้าที่ชื่นชอบ</Link>
                    {(user?.role === 'STAFF' || user?.role === 'ADMIN') && (
                      <>
                        <div className="mx-3 my-1 border-t border-slate-200" />
                        <p className="px-3 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">ระบบจัดการ</p>
                        <Link to="/staff" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold text-indigo-700 hover:bg-indigo-50"><MdDashboard className="h-5 w-5" />แดชบอร์ดพนักงาน</Link>
                      </>
                    )}
                    {user?.role === 'ADMIN' && (
                      <Link to="/admin" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 rounded-lg bg-purple-50 px-3 py-2.5 font-semibold text-purple-700 hover:bg-purple-100"><MdAdminPanelSettings className="h-5 w-5" />แดชบอร์ดผู้ดูแล</Link>
                    )}
                    <div className="mx-3 my-1 border-t border-slate-200" />
                    <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-red-50 hover:text-red-600"><MdLogout className="h-5 w-5" />ออกจากระบบ</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 border-l border-blue-600 pl-3 text-white hover:text-sky-200 sm:pl-5">
              <MdOutlinePerson className="h-6 w-6" aria-hidden="true" />
              <span className="hidden text-xs font-semibold sm:inline">เข้าสู่ระบบ</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
