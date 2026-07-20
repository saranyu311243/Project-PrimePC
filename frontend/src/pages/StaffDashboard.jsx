import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdRefresh, MdLocalShipping, MdPaid, MdQuestionAnswer, MdLogout } from 'react-icons/md'
import { getOrders } from '../services/orderService'
import { confirmPayment } from '../services/paymentService'
import { createShipment, updateShipmentStatus } from '../services/shipmentService'
import { getAllInquiries, respondInquiry, closeInquiry } from '../services/inquiryService'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { useFavorites } from '../hooks/useFavorites'

const money = (value) => `฿${Number(value || 0).toLocaleString('th-TH')}`

const SHIPMENT_STATUSES = ['PREPARING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']

const ORDER_STATUS_TH = {
  PENDING: 'รอชำระเงิน',
  CONFIRMED: 'ยืนยันแล้ว',
  PROCESSING: 'กำลังเตรียมสินค้า',
  SHIPPING: 'กำลังจัดส่ง',
  DELIVERED: 'จัดส่งสำเร็จ',
  CANCELLED: 'ยกเลิกแล้ว',
}

const INQUIRY_STATUS_TH = {
  OPEN: 'รอตอบกลับ',
  RESPONDED: 'ตอบกลับแล้ว',
  CLOSED: 'ปิดแล้ว',
}


const fmtDate = (value) =>
  value ? new Date(value).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

// Maps an order's status to how many of the 4 progress steps are complete
const ORDER_STEP_LABELS = ['ยืนยันคำสั่งซื้อ', 'ชำระเงิน', 'เตรียม/จัดส่งสินค้า', 'จัดส่งสำเร็จ']
const getCompletedSteps = (order) => {
  switch (order.status) {
    case 'CONFIRMED': return 1
    case 'PROCESSING': return 2
    case 'SHIPPING': return 3
    case 'DELIVERED': return 4
    default: return 0
  }
}

function OrderStepIndicator({ order }) {
  if (order.status === 'CANCELLED') {
    return (
      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
        {ORDER_STATUS_TH.CANCELLED}
      </span>
    )
  }

  const completed = getCompletedSteps(order)

  return (
    <div className="flex items-center" title={ORDER_STATUS_TH[order.status] ?? order.status}>
      {ORDER_STEP_LABELS.map((label, idx) => {
        const stepNum = idx + 1
        const done = stepNum <= completed
        return (
          <div key={label} className="flex items-center">
            <div
              className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${
                done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {stepNum}
            </div>
            {idx < ORDER_STEP_LABELS.length - 1 && (
              <div className={`h-1 w-8 ${stepNum < completed ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

const parseShippingAddress = (shippingAddress) => {
  if (!shippingAddress) return {}
  const [fullName, phone, ...addressParts] = shippingAddress.split('|').map((segment) => segment.trim())
  return {
    fullName: fullName || '',
    phone: phone || '',
    address: addressParts.filter(Boolean).join(' | ') || ''
  }
}

function StaffDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { clearCart } = useCart()
  const { clearFavorites } = useFavorites()
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [responses, setResponses] = useState({})

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [orderList, inquiryList] = await Promise.all([
        getOrders({ limit: 100 }),
        getAllInquiries({ limit: 100 }),
      ])
      setOrders(orderList.orders)
      setInquiries(inquiryList.inquiries)
    } catch (err) {
      setError(err.response?.data?.message || 'โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch orders/inquiries on mount
    load()
  }, [])

  const visibleOrders = useMemo(() => orders.filter((o) => o.payment), [orders])
  const pendingCount = useMemo(() => visibleOrders.filter((o) => o.status === 'PENDING').length, [visibleOrders])
  const openInquiries = useMemo(() => inquiries.filter((i) => i.status !== 'CLOSED').length, [inquiries])


  const doConfirmPayment = async (order) => {
    if (!order.payment?.id) return
    setBusyId(order.id)
    setError('')
    try {
      await confirmPayment(order.payment.id, 'SUCCESS')
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'ยืนยันการชำระเงินไม่สำเร็จ')
      setBusyId(null)
    }
  }

  const doCreateShipment = async (order) => {
    setBusyId(order.id)
    setError('')
    try {
      await createShipment({ orderId: order.id })
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'สร้างการจัดส่งไม่สำเร็จ (ออเดอร์ต้องชำระเงินสำเร็จก่อน)')
      setBusyId(null)
    }
  }

  const changeShipment = async (order, status) => {
    if (!order.shipment?.id) return
    setBusyId(order.id)
    setError('')
    try {
      await updateShipmentStatus(order.shipment.id, status)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'อัปเดตการจัดส่งไม่สำเร็จ')
      setBusyId(null)
    }
  }

  const sendResponse = async (id) => {
    const text = (responses[id] || '').trim()
    if (!text) return
    setBusyId(id)
    setError('')
    try {
      const updated = await respondInquiry(id, text)
      setInquiries((cur) => cur.map((i) => (i.id === id ? { ...i, ...updated } : i)))
      setResponses((cur) => ({ ...cur, [id]: '' }))
    } catch (err) {
      setError(err.response?.data?.message || 'ตอบกลับไม่สำเร็จ')
    } finally {
      setBusyId(null)
    }
  }

  const doCloseInquiry = async (id) => {
    setBusyId(id)
    try {
      const updated = await closeInquiry(id)
      setInquiries((cur) => cur.map((i) => (i.id === id ? { ...i, ...updated } : i)))
    } catch (err) {
      setError(err.response?.data?.message || 'ปิดคำถามไม่สำเร็จ')
    } finally {
      setBusyId(null)
    }
  }

  const handleLogout = () => {
    clearCart()
    clearFavorites()
    logout()
    navigate('/login')
  }

  const sidebarNavItem = (id, label, Icon) => (
    <button
      onClick={() => setTab(id)}
      className={`flex w-full items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold transition ${
        tab === id ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/10'
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  )

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <aside className="flex shrink-0 flex-col rounded-3xl bg-blue-900 p-4 text-white lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-64 lg:overflow-y-auto">
        <div className="whitespace-nowrap px-2 pb-4 pt-1 text-2xl font-black italic tracking-tighter">
          PRIME<span className="text-sky-300">PC</span>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sky-400 text-sm font-black text-blue-950">
            {(user?.name || user?.email || 'S').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="whitespace-nowrap text-sm font-bold text-white">{user?.name || user?.email || 'พนักงาน'}</p>
            <p className="whitespace-nowrap text-xs text-blue-300">{user?.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'พนักงาน'}</p>
          </div>
        </div>

        <p className="whitespace-nowrap px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-widest text-blue-300">เมนูพนักงาน</p>
        <nav className="flex flex-col gap-1">
          {sidebarNavItem('orders', 'คำสั่งซื้อ & จัดส่ง', MdLocalShipping)}
          {sidebarNavItem('inquiries', 'คำถามลูกค้า', MdQuestionAnswer)}
        </nav>

        <div className="mt-auto pt-4">
          <div className="mb-2 border-t border-blue-800" />
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold text-blue-100 transition hover:bg-white/10 hover:text-white"
          >
            <MdLogout className="h-5 w-5" />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 rounded-3xl bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-sky-600">แดชบอร์ดพนักงาน</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">จัดการคำสั่งซื้อและการจัดส่ง</h1>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <MdRefresh className="h-5 w-5" />รีเฟรช
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500">คำสั่งซื้อทั้งหมด</p>
            <p className="mt-2 text-2xl font-black text-blue-800">{loading ? '—' : visibleOrders.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500">รอดำเนินการ</p>
            <p className="mt-2 text-2xl font-black text-amber-600">{loading ? '—' : pendingCount}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500">คำถามที่ยังไม่ปิด</p>
            <p className="mt-2 text-2xl font-black text-indigo-600">{loading ? '—' : openInquiries}</p>
          </div>
        </section>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">{error}</p>}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />)}
          </div>
        ) : tab === 'orders' ? (
          <section className="space-y-4">
            {visibleOrders.length === 0 && (
              <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">ยังไม่มีคำสั่งซื้อ</p>
            )}
            {visibleOrders.map((order) => (
              <article key={order.id} className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-black text-slate-900">คำสั่งซื้อ #{order.id}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {order.user?.name || `ผู้ใช้ #${order.userId}`} · {fmtDate(order.createdAt)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {order.orderItems?.length ?? 0} รายการ · รวม{' '}
                      <strong className="text-blue-800">{money(order.totalAmount)}</strong>
                    </p>
                  </div>
                  <OrderStepIndicator order={order} />
                </div>

                <div className="mt-4 grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-[1.1fr_1fr]">
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-900">ข้อมูลลูกค้า</p>
                    <p><span className="font-semibold text-slate-700">ชื่อ:</span> {order.user?.name || parseShippingAddress(order.shippingAddress).fullName || `ผู้ใช้ #${order.userId}`}</p>
                    <p><span className="font-semibold text-slate-700">เบอร์ติดต่อ:</span> {order.user?.phone || parseShippingAddress(order.shippingAddress).phone || 'ไม่ระบุ'}</p>
                    <p className="break-words"><span className="font-semibold text-slate-700">ที่อยู่จัดส่ง:</span> {parseShippingAddress(order.shippingAddress).address || order.shippingAddress || 'ไม่ระบุ'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-900">สินค้าในคำสั่งซื้อ</p>
                    {(order.orderItems ?? []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 shadow-sm">
                        <span className="min-w-0 truncate text-slate-700">{item.product?.name || `สินค้า #${item.productId}`} × {item.quantity}</span>
                        <strong className="text-slate-900">{money(item.price * item.quantity)}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">สถานะ:</span> {ORDER_STATUS_TH[order.status] ?? order.status}
                  </div>

                  {order.payment ? (
                    order.payment.status === 'PENDING' && order.status !== 'CANCELLED' ? (
                      <button
                        onClick={() => doConfirmPayment(order)}
                        disabled={busyId === order.id}
                        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <MdPaid className="h-4 w-4" />ยืนยันการชำระเงิน
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                        <MdPaid className="h-4 w-4" />ชำระแล้ว ({order.payment.method})
                      </span>
                    )
                  ) : (
                    <span className="text-sm text-slate-400">ยังไม่มีการชำระเงิน</span>
                  )}

                  {order.shipment ? (
                    <label className="flex items-center gap-2 text-sm">
                      <MdLocalShipping className="h-4 w-4 text-blue-600" />
                      <select
                        value={order.shipment.status}
                        disabled={busyId === order.id}
                        onChange={(e) => changeShipment(order, e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-600"
                      >
                        {SHIPMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <span className="text-xs text-slate-400">{order.shipment.trackingNumber}</span>
                    </label>
                  ) : (
                    order.payment?.status === 'SUCCESS' && (
                      <button
                        onClick={() => doCreateShipment(order)}
                        disabled={busyId === order.id}
                        className="flex items-center gap-2 rounded-lg border border-blue-300 px-3 py-1.5 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                      >
                        <MdLocalShipping className="h-4 w-4" />สร้างการจัดส่ง
                      </button>
                    )
                  )}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="space-y-4">
            {inquiries.length === 0 && (
              <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">ยังไม่มีคำถามจากลูกค้า</p>
            )}
            {inquiries.map((inq) => (
              <article key={inq.id} className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900">{inq.user?.name || `ผู้ใช้ #${inq.userId}`}</p>
                    <p className="mt-1 text-xs text-slate-400">{fmtDate(inq.createdAt)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                    inq.status === 'CLOSED' ? 'bg-slate-100 text-slate-600'
                    : inq.status === 'RESPONDED' ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                  }`}>
                    {INQUIRY_STATUS_TH[inq.status] ?? inq.status}
                  </span>
                </div>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 border border-slate-100">{inq.message}</p>
                {inq.response && (
                  <p className="mt-2 rounded-xl bg-blue-50 p-3 text-sm text-blue-800 border border-blue-100">
                    <strong>ตอบกลับ:</strong> {inq.response}
                  </p>
                )}
                {inq.status !== 'CLOSED' && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={responses[inq.id] || ''}
                      onChange={(e) => setResponses((cur) => ({ ...cur, [inq.id]: e.target.value }))}
                      placeholder="พิมพ์คำตอบ..."
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                    />
                    <button
                      onClick={() => sendResponse(inq.id)}
                      disabled={busyId === inq.id}
                      className="flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50"
                    >
                      <MdQuestionAnswer className="h-4 w-4" />ตอบกลับ
                    </button>
                    <button
                      onClick={() => doCloseInquiry(inq.id)}
                      disabled={busyId === inq.id}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      ปิดคำถาม
                    </button>
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
    </div>
  )
}

export default StaffDashboard