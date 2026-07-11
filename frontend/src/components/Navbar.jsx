import { Link, NavLink } from 'react-router-dom'

function SearchIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="11" cy="11" r="7" strokeWidth="2" />
      <path d="m20 20-4-4" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M3 4h2l2 11h10l2-8H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="19" r="1.5" fill="currentColor" />
      <circle cx="17" cy="19" r="1.5" fill="currentColor" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.6-5 3.2-7.5 8-7.5s7.4 2.5 8 7.5H4Z" />
    </svg>
  )
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-blue-800 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:flex-nowrap lg:gap-5 lg:px-8">
        <NavLink to="/" className="shrink-0 text-2xl font-black italic tracking-tighter sm:text-3xl" aria-label="PrimePC หน้าแรก">
          PRIME<span className="text-sky-300">PC</span>
        </NavLink>

        <form className="order-3 flex w-full overflow-hidden rounded-sm bg-white text-slate-800 lg:order-none lg:flex-1" role="search">
          <label className="sr-only" htmlFor="product-search">ค้นหาสินค้า</label>
          <input
            id="product-search"
            type="search"
            placeholder="ค้นหาสินค้าอะไรดี ?"
            className="min-w-0 flex-1 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400"
          />
          <select
            aria-label="เลือกหมวดหมู่สินค้า"
            className="hidden border-l border-slate-200 bg-slate-50 px-3 text-xs outline-none md:block"
            defaultValue="all"
          >
            <option value="all">หมวดหมู่สินค้า</option>
            <option value="cpu">ซีพียู</option>
            <option value="gpu">การ์ดจอ</option>
            <option value="notebook">โน้ตบุ๊ก</option>
            <option value="accessory">อุปกรณ์เสริม</option>
          </select>
          <button type="submit" className="grid w-12 place-items-center bg-sky-500 text-white transition hover:bg-sky-600" aria-label="ค้นหา">
            <SearchIcon />
          </button>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-5">
          <Link to="/cart" className="relative flex items-center gap-2 text-white hover:text-sky-200">
            <span className="relative">
              <CartIcon />
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-sky-400 px-1 text-[10px] font-bold text-blue-950">0</span>
            </span>
            <span className="hidden text-xs font-semibold sm:inline">ตะกร้าสินค้า</span>
          </Link>

          <Link to="/login" className="flex items-center gap-2 border-l border-blue-600 pl-3 text-white hover:text-sky-200 sm:pl-5">
            <UserIcon />
            <span className="hidden text-xs font-semibold sm:inline">เข้าสู่ระบบ</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Navbar
