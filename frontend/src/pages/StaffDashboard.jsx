import { useEffect, useMemo, useState } from 'react'
import { MdRefresh, MdLocalShipping, MdPaid, MdQuestionAnswer } from 'react-icons/md'
import { getOrders, updateOrderStatus } from '../services/orderService'
import { confirmPayment } from '../services/paymentService'
import { createShipment, updateShipmentStatus } from '../services/shipmentService'
import { getAllInquiries, respondInquiry, closeInquiry } from '../services/inquiryService'

const money = (value) => `฿${Number(value || 0).toLocaleString('th-TH')}`
const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED']
const SHIPMENT_STATUSES = ['PREPARING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']

const statusColor = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-sky-100 text-sky-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPING: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
}

const fmtDate = (value) => (value ? new Date(value).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : '—')

function StaffDashboard() {
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

  const pendingCount = useMemo(() => orders.filter((o) => o.status === 'PENDING').length, [orders])
  const openInquiries = useMemo(() => inquiries.filter((i) => i.status !== 'CLOSED').length, [inquiries])

  const patchOrder = (id, patch) => setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, ...patch } : o)))

  const changeStatus = async (id, status) => {
    setBusyId(id)
    setError('')
    try {
      const updated = await updateOrderStatus(id, status)
      patchOrder(id, { status: updated?.status ?? status })
    } catch (err) {
      setError(err.response?.data?.message || 'อัปเดตสถานะไม่สำเร็จ')
    } finally {
      setBusyId(null)
    }
  }

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

  const tabButton = (id, label) => (
    <button
      onClick={() => setTab(id)}
      className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${tab === id ? 'bg-blue-700 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-blue-50'}`}
    >
      {label}
    </button>
  )

  return (
    <div className="rounded-3xl bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-sky-600">แดชบอร์ดพนักงาน</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">จัดการคำสั่งซื้อ การจัดส่ง และคำถามลูกค้า</h1>
          </div>
          <button onClick={load} className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
            <MdRefresh className="h-5 w-5" />รีเฟรช
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-600">คำสั่งซื้อทั้งหมด</p><p className="mt-2 text-2xl font-black text-blue-800">{loading ? '—' : orders.length}</p></div>
          <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-600">รอดำเนินการ</p><p className="mt-2 text-2xl font-black text-amber-600">{loading ? '—' : pendingCount}</p></div>
          <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-600">คำถามที่ยังไม่ปิด</p><p className="mt-2 text-2xl font-black text-indigo-600">{loading ? '—' : openInquiries}</p></div>
        </section>

        <div className="flex flex-wrap gap-3">
          {tabButton('orders', 'คำสั่งซื้อ & การจัดส่ง')}
          {tabButton('inquiries', 'คำถามลูกค้า')}
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-sm text-slate-500">กำลังโหลด...</p>
        ) : tab === 'orders' ? (
          <section className="space-y-4">
            {orders.length === 0 && <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">ยังไม่มีคำสั่งซื้อ</p>}
            {orders.map((order) => (
              <article key={order.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-black text-slate-900">คำสั่งซื้อ #{order.id}</p>
                    <p className="mt-1 text-sm text-slate-500">{order.user?.name || `ผู้ใช้ #${order.userId}`} · {fmtDate(order.createdAt)}</p>
                    <p className="mt-1 text-sm text-slate-500">{order.orderItems?.length ?? 0} รายการ · รวม <strong className="text-blue-800">{money(order.totalAmount)}</strong></p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor[order.status] ?? 'bg-slate-100 text-slate-600'}`}>{order.status}</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-slate-600">สถานะ:</span>
                    <select
                      value={order.status}
                      disabled={busyId === order.id || order.status === 'CANCELLED'}
                      onChange={(e) => changeStatus(order.id, e.target.value)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 outline-none focus:border-blue-600 disabled:bg-slate-100"
                    >
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>

                  {order.payment ? (
                    order.payment.status === 'PENDING' ? (
                      <button onClick={() => doConfirmPayment(order)} disabled={busyId === order.id} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
                        <MdPaid className="h-4 w-4" />ยืนยันการชำระเงิน
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600"><MdPaid className="h-4 w-4" />ชำระแล้ว ({order.payment.method})</span>
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
                        className="rounded-lg border border-slate-300 px-3 py-1.5 outline-none focus:border-blue-600"
                      >
                        {SHIPMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <span className="text-xs text-slate-400">{order.shipment.trackingNumber}</span>
                    </label>
                  ) : (
                    order.payment?.status === 'SUCCESS' && (
                      <button onClick={() => doCreateShipment(order)} disabled={busyId === order.id} className="flex items-center gap-2 rounded-lg border border-blue-300 px-3 py-1.5 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50">
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
            {inquiries.length === 0 && <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">ยังไม่มีคำถามจากลูกค้า</p>}
            {inquiries.map((inq) => (
              <article key={inq.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900">{inq.user?.name || `ผู้ใช้ #${inq.userId}`}</p>
                    <p className="mt-1 text-xs text-slate-400">{fmtDate(inq.createdAt)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${inq.status === 'CLOSED' ? 'bg-slate-100 text-slate-600' : inq.status === 'RESPONDED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{inq.status}</span>
                </div>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{inq.message}</p>
                {inq.response && <p className="mt-2 rounded-xl bg-blue-50 p-3 text-sm text-blue-800"><strong>ตอบกลับ:</strong> {inq.response}</p>}

                {inq.status !== 'CLOSED' && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={responses[inq.id] || ''}
                      onChange={(e) => setResponses((cur) => ({ ...cur, [inq.id]: e.target.value }))}
                      placeholder="พิมพ์คำตอบ..."
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                    />
                    <button onClick={() => sendResponse(inq.id)} disabled={busyId === inq.id} className="flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50">
                      <MdQuestionAnswer className="h-4 w-4" />ตอบกลับ
                    </button>
                    <button onClick={() => doCloseInquiry(inq.id)} disabled={busyId === inq.id} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                      ปิด
                    </button>
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}

export default StaffDashboard
