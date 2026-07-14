import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MdInventory2, MdOutlineReceiptLong } from 'react-icons/md'
import { useAuth } from '../hooks/useAuth'
import { getOrders, cancelOrder } from '../services/orderService'

const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })

const fmtDate = (iso) => {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

// Order status -> Thai label + badge colour
const statusMeta = {
  PENDING: { label: 'รอชำระเงิน', className: 'bg-amber-50 text-amber-700' },
  CONFIRMED: { label: 'ยืนยันคำสั่งซื้อแล้ว', className: 'bg-sky-50 text-sky-700' },
  PROCESSING: { label: 'กำลังเตรียมสินค้า', className: 'bg-indigo-50 text-indigo-700' },
  SHIPPING: { label: 'กำลังจัดส่ง', className: 'bg-blue-50 text-blue-700' },
  DELIVERED: { label: 'จัดส่งสำเร็จ', className: 'bg-emerald-50 text-emerald-700' },
  CANCELLED: { label: 'ยกเลิกแล้ว', className: 'bg-red-50 text-red-600' },
}

const CANCELLABLE = ['PENDING', 'CONFIRMED', 'PROCESSING']

function OrderHistoryPage() {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  // Must be logged in — orders are tied to the account.
  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/login', { state: { from: '/orders' } })
  }, [authLoading, isAuthenticated, navigate])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { orders: list } = await getOrders()
      setOrders(list)
    } catch (err) {
      setError(err.response?.data?.message || 'ไม่สามารถโหลดประวัติคำสั่งซื้อได้')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch orders once authenticated
    if (isAuthenticated) load()
  }, [isAuthenticated])

  const handleCancel = async (id) => {
    if (!window.confirm('ยืนยันการยกเลิกคำสั่งซื้อนี้? ระบบจะคืนสต็อกสินค้าให้อัตโนมัติ')) return
    setCancellingId(id)
    try {
      await cancelOrder(id)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'ยกเลิกคำสั่งซื้อไม่สำเร็จ')
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="rounded-3xl bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="text-sm font-bold uppercase tracking-wide text-sky-600">ประวัติคำสั่งซื้อ</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">รายการสั่งซื้อของฉัน</h1>
        </header>

        {loading && (
          <section className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-slate-500">กำลังโหลดข้อมูล...</p>
          </section>
        )}

        {!loading && error && (
          <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-red-600">{error}</p>
            <button onClick={load} className="mt-4 rounded-xl bg-blue-700 px-5 py-2.5 font-bold text-white hover:bg-blue-800">ลองใหม่</button>
          </section>
        )}

        {!loading && !error && orders.length === 0 && (
          <section className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <MdOutlineReceiptLong className="mx-auto h-16 w-16 text-slate-300" />
            <p className="mt-4 font-black text-slate-900">ยังไม่มีคำสั่งซื้อ</p>
            <p className="mt-2 text-sm text-slate-500">เริ่มเลือกซื้อสินค้าที่คุณสนใจได้เลย</p>
            <Link to="/products?category=cpu" className="mt-6 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800">เลือกซื้อสินค้า</Link>
          </section>
        )}

        {!loading && !error && orders.length > 0 && (
          <section className="space-y-4">
            {orders.map((order) => {
              const meta = statusMeta[order.status] ?? { label: order.status, className: 'bg-slate-100 text-slate-600' }
              const itemCount = (order.orderItems ?? []).reduce((sum, it) => sum + it.quantity, 0)
              return (
                <article key={order.id} className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <p className="font-black text-slate-900">คำสั่งซื้อ #{order.id}</p>
                      <p className="mt-1 text-sm text-slate-500">{fmtDate(order.createdAt)} · {itemCount} ชิ้น</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${meta.className}`}>{meta.label}</span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {(order.orderItems ?? []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex min-w-0 items-center gap-2 text-slate-600">
                          <MdInventory2 className="h-4 w-4 shrink-0 text-slate-300" />
                          <span className="truncate">{item.product?.name ?? `สินค้า #${item.productId}`} × {item.quantity}</span>
                        </span>
                        <strong className="shrink-0 text-slate-700">฿{money(item.price * item.quantity)}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div className="flex gap-2">
                      <Link
                        to="/order-tracking"
                        state={{ orderId: order.id }}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                      >
                        ติดตามสถานะ
                      </Link>
                      {CANCELLABLE.includes(order.status) && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          disabled={cancellingId === order.id}
                          className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {cancellingId === order.id ? 'กำลังยกเลิก...' : 'ยกเลิก'}
                        </button>
                      )}
                    </div>
                    <p className="text-right"><span className="text-xs text-slate-500">ยอดรวม</span><br /><strong className="text-xl font-black text-blue-800">฿{money(order.totalAmount)}</strong></p>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </div>
    </div>
  )
}

export default OrderHistoryPage
