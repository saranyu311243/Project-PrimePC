import { useEffect, useState } from 'react'
import { MdAdd, MdDeleteOutline, MdLocalShipping, MdOutlineShoppingCart, MdRemove } from 'react-icons/md'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'

const money = (value) => value.toLocaleString('th-TH', { minimumFractionDigits: 2 })

function CartPage() {
  const navigate = useNavigate()
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart()
  const { isAuthenticated } = useAuth()
  const [coupon, setCoupon] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState('')
  const [couponMessage, setCouponMessage] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  const discount = appliedCoupon === 'PRIMEPC100' ? Math.min(100, subtotal) : 0
  const total = subtotal - discount

  const applyCoupon = (event) => {
    event.preventDefault()
    const code = coupon.trim().toUpperCase()
    const valid = code === 'PRIMEPC100'
    setAppliedCoupon(valid ? code : '')
    setCouponMessage(valid ? 'ใช้คูปองสำเร็จ ลดทันที 100 บาท' : 'ไม่พบโค้ดคูปองนี้')
  }

  const proceedToCheckout = () => {
    // Checkout requires a login (order is created against the user account).
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } })
      return
    }
    navigate('/checkout', { state: { discount, coupon: appliedCoupon } })
  }

  if (!items.length) {
    return (
      <section className="grid min-h-[560px] place-items-center rounded-3xl bg-slate-100 p-8 text-center">
        <div>
          <MdOutlineShoppingCart className="mx-auto h-20 w-20 text-slate-300" />
          <h1 className="mt-5 text-3xl font-black text-slate-900">ยังไม่มีสินค้าในตะกร้า</h1>
          <Link to="/products?category=cpu" className="mt-7 inline-flex rounded-xl bg-blue-700 px-7 py-3 font-bold text-white hover:bg-blue-800">เลือกซื้อสินค้า</Link>
        </div>
      </section>
    )
  }

  return (
    <div className="rounded-3xl bg-slate-100 p-5 sm:p-8">
      <div className="cart-page-grid grid items-start gap-5">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">PRIMEPC CART</p><h1 className="text-3xl font-black leading-tight text-slate-900">ตะกร้าสินค้า</h1></div>
            <p className="text-sm font-semibold text-slate-500">รวม {itemCount} ชิ้น</p>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <article key={item.id} className="cart-product-row relative grid items-center gap-5 rounded-2xl bg-slate-50 p-5">
                <Link to={`/products/${item.id}`} className="grid h-40 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50">
                  {item.image_url ? <img src={item.image_url} alt={item.name} className="h-full w-full object-contain p-3" /> : <span className="grid h-24 w-32 place-items-center rounded-lg bg-gradient-to-br from-slate-950 to-blue-900 text-2xl font-black text-sky-300 shadow-lg">{item.icon}</span>}
                </Link>

                <div className="min-w-0 pr-8">
                  <p className="text-xs font-bold uppercase tracking-wide text-sky-600">{item.brand}</p>
                  <Link to={`/products/${item.id}`} className="mt-2 block text-lg font-extrabold leading-7 text-slate-900 hover:text-blue-700">{item.name}</Link>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{item.description}</p>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-5">
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="grid h-10 w-10 place-items-center rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50" aria-label="ลดจำนวน"><MdRemove /></button>
                      <span className="min-w-8 text-center text-lg font-black">{String(item.quantity).padStart(2, '0')}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="grid h-10 w-10 place-items-center rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50" aria-label="เพิ่มจำนวน"><MdAdd /></button>
                    </div>
                    <div className="text-right"><p className="text-xs text-slate-500">รวมรายการนี้</p><p className="text-2xl font-black text-blue-800">฿{money(item.price * item.quantity)}</p></div>
                  </div>
                </div>

                <button type="button" onClick={() => removeItem(item.id)} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`ลบ ${item.name}`}><MdDeleteOutline className="h-6 w-6" /></button>
              </article>
            ))}
          </div>
        </section>

        <aside className="sticky top-28 space-y-4">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">โค้ดส่วนลด</h2>
            <form onSubmit={applyCoupon} className="mt-4">
              <div className="flex gap-2"><input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="กรอกรหัสคูปอง" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500" /><button type="submit" className="rounded-xl bg-sky-500 px-5 font-bold text-white hover:bg-sky-600">ใช้งาน</button></div>
              <p className={`mt-3 text-sm ${appliedCoupon ? 'text-emerald-600' : 'text-slate-500'}`}>{couponMessage || 'ทดลองใช้โค้ด PRIMEPC100'}</p>
            </form>
          </section>

          <section className="flex min-h-[390px] flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900">สรุปรายการสั่งซื้อ</h2>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between gap-4"><span className="text-slate-600">คำสั่งซื้อสินค้าทั้งหมด ({itemCount} ชิ้น)</span><strong>฿{money(subtotal)}</strong></div>
              <div className="flex justify-between gap-4"><span className="text-slate-600">คูปอง / โค้ดส่วนลด</span><strong className="text-emerald-600">-฿{money(discount)}</strong></div>
              <div className="flex justify-between gap-4 border-t border-slate-200 pt-5 text-lg"><span className="font-black">ยอดรวมสุทธิ</span><strong className="text-blue-800">฿{money(total)}</strong></div>
            </div>
            <div className="mt-6 flex gap-3 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-900"><MdLocalShipping className="mt-0.5 h-7 w-7 shrink-0" /><p>จัดส่งฟรีทั่วไทยเมื่อยอดสั่งซื้อครบ 5,000 บาท</p></div>
            <button type="button" onClick={proceedToCheckout} className="mt-auto w-full rounded-2xl bg-blue-700 px-5 py-4 text-lg font-black text-white hover:bg-blue-800">ดำเนินการต่อ</button>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default CartPage
