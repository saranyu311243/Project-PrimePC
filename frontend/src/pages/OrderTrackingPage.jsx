import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { MdCheckCircle, MdLocalShipping, MdOutlineInventory, MdPending, MdSearch } from 'react-icons/md'
import { getOrderById } from '../services/orderService'

const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })

// The tracking timeline maps order + shipment status onto ordered steps.
const STEPS = [
  { key: 'PENDING', label: 'รับคำสั่งซื้อ', icon: MdPending },
  { key: 'PROCESSING', label: 'เตรียมสินค้า', icon: MdOutlineInventory },
  { key: 'SHIPPING', label: 'กำลังจัดส่ง', icon: MdLocalShipping },
  { key: 'DELIVERED', label: 'จัดส่งสำเร็จ', icon: MdCheckCircle },
]

// How far along the timeline a given order status is.
const statusIndex = (status) => {
  switch (status) {
    case 'PENDING':
    case 'CONFIRMED':
      return 0
    case 'PROCESSING':
      return 1
    case 'SHIPPING':
      return 2
    case 'DELIVERED':
      return 3
    default:
      return 0
  }
}

const shipmentStatusLabel = {
  PREPARING: 'กำลังเตรียมพัสดุ',
  SHIPPED: 'ส่งมอบให้ขนส่งแล้ว',
  IN_TRANSIT: 'อยู่ระหว่างการจัดส่ง',
  DELIVERED: 'จัดส่งสำเร็จ',
  CANCELLED: 'ยกเลิกการจัดส่ง',
}

function OrderTrackingPage() {
  const location = useLocation()
  const [trackingId, setTrackingId] = useState(location.state?.orderId ? String(location.state.orderId) : '')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  const lookup = useCallback(async (id) => {
    const numericId = parseInt(String(id).replace(/\D/g, ''), 10)
    if (!numericId) {
      setError('กรุณากรอกหมายเลขคำสั่งซื้อให้ถูกต้อง')
      setOrder(null)
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await getOrderById(numericId)
      setOrder(result)
    } catch (err) {
      if (err.response?.status === 404) setError('ไม่พบคำสั่งซื้อหมายเลขนี้')
      else if (err.response?.status === 403) setError('คุณไม่มีสิทธิ์ดูคำสั่งซื้อนี้')
      else setError(err.response?.data?.message || 'ไม่สามารถค้นหาคำสั่งซื้อได้')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-load when arriving from the order-history "ติดตามสถานะ" link.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- look up order when deep-linked
    if (location.state?.orderId) lookup(location.state.orderId)
  }, [location.state, lookup])

  const submit = (e) => {
    e.preventDefault()
    lookup(trackingId)
  }

  const currentStep = order ? statusIndex(order.status) : -1
  const cancelled = order?.status === 'CANCELLED'

  return (
    <div className="rounded-3xl bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="text-sm font-bold uppercase tracking-widest text-sky-600">ติดตามพัสดุ</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">ติดตามคำสั่งซื้อของคุณ</h1>
        </header>

        <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-sm">
          <label className="text-sm font-semibold text-slate-700">หมายเลขคำสั่งซื้อ</label>
          <div className="mt-3 flex gap-3">
            <input
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500"
              placeholder="เช่น 1024"
            />
            <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 font-black text-white hover:bg-blue-800 disabled:bg-slate-300">
              <MdSearch className="h-5 w-5" />{loading ? 'กำลังค้นหา...' : 'ค้นหา'}
            </button>
          </div>
          {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        </form>

        {order && (
          <section className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="font-black text-slate-900">คำสั่งซื้อ #{order.id}</p>
                <p className="mt-1 text-sm text-slate-500">ยอดรวม ฿{money(order.totalAmount)}</p>
              </div>
              {order.shipment?.trackingNumber && (
                <div className="text-right">
                  <p className="text-xs text-slate-500">เลขพัสดุ</p>
                  <p className="font-bold text-slate-700">{order.shipment.trackingNumber}</p>
                </div>
              )}
            </div>

            {cancelled ? (
              <div className="rounded-xl bg-red-50 px-4 py-6 text-center">
                <p className="text-lg font-black text-red-600">คำสั่งซื้อนี้ถูกยกเลิกแล้ว</p>
              </div>
            ) : (
              <ol className="relative flex justify-between">
                {STEPS.map((step, index) => {
                  const Icon = step.icon
                  const reached = index <= currentStep
                  return (
                    <li key={step.key} className="relative z-10 flex flex-1 flex-col items-center gap-2 text-center">
                      <span className={`grid h-11 w-11 place-items-center rounded-full border-2 ${reached ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-300'}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className={`text-xs font-bold ${reached ? 'text-blue-700' : 'text-slate-400'}`}>{step.label}</span>
                    </li>
                  )
                })}
                {/* progress line behind the icons */}
                <div className="absolute left-0 top-[22px] -z-0 h-0.5 w-full bg-slate-200">
                  <div className="h-full bg-blue-600 transition-all" style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} />
                </div>
              </ol>
            )}

            {order.shipment && (
              <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                สถานะการจัดส่ง: <strong className="text-slate-800">{shipmentStatusLabel[order.shipment.status] ?? order.shipment.status}</strong>
                {order.shipment.deliveredAt && ` · ส่งถึงเมื่อ ${new Date(order.shipment.deliveredAt).toLocaleDateString('th-TH')}`}
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

export default OrderTrackingPage
