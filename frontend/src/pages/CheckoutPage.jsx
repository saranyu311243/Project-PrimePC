import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MdOutlineShoppingCart } from 'react-icons/md'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { createOrder } from '../services/orderService'

const money = (value) => value.toLocaleString('th-TH', { minimumFractionDigits: 2 })

const readStorage = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { items, subtotal, itemCount } = useCart()
  const { isAuthenticated, user } = useAuth()
  const discount = location.state?.discount ?? 0

  // Prefill contact/address from the saved profile + address book.
  const savedProfile = useMemo(() => readStorage('primepc-profile', {}), [])
  const savedAddress = useMemo(() => readStorage('primepc-address', null), [])

  const composedAddress = savedAddress
    ? [savedAddress.address, savedAddress.subdistrict, savedAddress.district, savedAddress.province, savedAddress.postalCode]
        .filter(Boolean)
        .join(' ')
    : ''

  const [form, setForm] = useState({
    fullName: savedAddress?.fullName || [savedProfile.firstName, savedProfile.lastName].filter(Boolean).join(' ') || user?.name || '',
    phone: savedAddress?.phone || savedProfile.phone || user?.phone || '',
    address: composedAddress || user?.address || '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const total = subtotal - discount
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  // Guard: must be logged in and have items.
  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { state: { from: '/checkout' } })
  }, [isAuthenticated, navigate])

  const placeOrder = async (event) => {
    event.preventDefault()
    setError('')
    if (!form.fullName.trim() || !/^0\d{9}$/.test(form.phone) || !form.address.trim()) {
      setError('กรุณากรอกชื่อผู้รับ เบอร์โทร (10 หลัก) และที่อยู่จัดส่งให้ครบถ้วน')
      return
    }
    if (!items.length) {
      setError('ไม่มีสินค้าในตะกร้า')
      return
    }

    setSubmitting(true)
    try {
      const shippingAddress = `${form.fullName} | ${form.phone} | ${form.address}`
      const orderItems = items.map((item) => ({ productId: item.id, quantity: item.quantity }))
      const result = await createOrder({ items: orderItems, shippingAddress })
      const order = result?.order ?? result
      // Move to payment with the created order id + amount (server-calculated total).
      navigate('/payment', {
        replace: true,
        state: { orderId: order.id, amount: order.totalAmount ?? total },
      })
    } catch (err) {
      setError(err.response?.data?.message || 'สร้างคำสั่งซื้อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setSubmitting(false)
    }
  }

  if (!items.length) {
    return (
      <section className="grid min-h-[480px] place-items-center rounded-3xl bg-slate-100 p-8 text-center">
        <div>
          <MdOutlineShoppingCart className="mx-auto h-16 w-16 text-slate-300" />
          <h1 className="mt-4 text-2xl font-black text-slate-900">ไม่มีสินค้าในตะกร้า</h1>
          <button onClick={() => navigate('/products?category=cpu')} className="mt-6 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800">เลือกซื้อสินค้า</button>
        </div>
      </section>
    )
  }

  return (
    <div className="rounded-3xl bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">เช็คเอาท์</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">ข้อมูลการจัดส่ง</h1>
        </header>

        <form onSubmit={placeOrder} className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">ที่อยู่จัดส่ง</h2>
            <div className="mt-5 grid gap-4">
              <label className="block"><span className="text-sm font-semibold text-slate-700">ชื่อ-นามสกุลผู้รับ</span><input value={form.fullName} onChange={(e) => update('fullName', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500" placeholder="ชื่อผู้รับ" /></label>
              <label className="block"><span className="text-sm font-semibold text-slate-700">เบอร์ติดต่อ</span><input value={form.phone} onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500" placeholder="08x-xxx-xxxx" /></label>
              <label className="block"><span className="text-sm font-semibold text-slate-700">ที่อยู่จัดส่ง</span><textarea value={form.address} onChange={(e) => update('address', e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500" placeholder="ที่อยู่, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์" /></label>
            </div>
            {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          </section>

          <aside className="sticky top-28 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">สรุปคำสั่งซื้อ</h2>
            <div className="mt-4 max-h-52 space-y-3 overflow-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between gap-3 text-sm">
                  <span className="min-w-0 flex-1 truncate text-slate-600">{item.name} × {item.quantity}</span>
                  <strong className="shrink-0">฿{money(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-3 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">รวมสินค้า ({itemCount} ชิ้น)</span><strong>฿{money(subtotal)}</strong></div>
              {discount > 0 && <div className="flex justify-between"><span className="text-slate-600">ส่วนลด</span><strong className="text-emerald-600">-฿{money(discount)}</strong></div>}
              <div className="flex justify-between border-t border-slate-200 pt-3 text-lg"><span className="font-black">ยอดสุทธิ</span><strong className="text-blue-800">฿{money(total)}</strong></div>
            </div>
            <button type="submit" disabled={submitting} className="mt-6 w-full rounded-2xl bg-blue-700 px-6 py-4 text-lg font-black text-white hover:bg-blue-800 disabled:bg-slate-300">
              {submitting ? 'กำลังสร้างคำสั่งซื้อ...' : 'ยืนยันและไปชำระเงิน'}
            </button>
            <p className="mt-3 text-center text-xs text-slate-400">ยอดชำระจะคำนวณจากราคาสินค้าจริงในระบบ</p>
          </aside>
        </form>
      </div>
    </div>
  )
}

export default CheckoutPage
