import { useEffect, useMemo, useState } from 'react'
import { MdRefresh, MdLocalShipping, MdPaid, MdQuestionAnswer, MdInventory2, MdAdd, MdEdit, MdDeleteOutline, MdClose, MdCheckCircle, MdSave } from 'react-icons/md'
import { getOrders, updateOrderStatus } from '../services/orderService'
import { confirmPayment } from '../services/paymentService'
import { createShipment, updateShipmentStatus } from '../services/shipmentService'
import { getAllInquiries, respondInquiry, closeInquiry } from '../services/inquiryService'
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../services/productService'

const money = (value) => `฿${Number(value || 0).toLocaleString('th-TH')}`

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED']
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

const statusColor = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-sky-100 text-sky-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPING: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
}

const fmtDate = (value) =>
  value ? new Date(value).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

const PRODUCT_CATEGORIES = [
  'cpu', 'motherboard', 'gpu', 'ram', 'storage', 'psu',
  'cooling', 'notebook', 'monitor', 'keyboard', 'mouse',
  'accessory', 'case', 'headset',
]

const CATEGORY_TH = {
  cpu: 'ซีพียู', motherboard: 'เมนบอร์ด', gpu: 'การ์ดจอ', ram: 'แรม',
  storage: 'อุปกรณ์จัดเก็บข้อมูล', psu: 'พาวเวอร์ซัพพลาย', cooling: 'ระบายความร้อน',
  notebook: 'โน้ตบุ๊ก', monitor: 'จอมอนิเตอร์', keyboard: 'คีย์บอร์ด',
  mouse: 'เมาส์', accessory: 'อุปกรณ์เสริม', case: 'เคส', headset: 'หูฟัง',
}

const EMPTY_PRODUCT = {
  name: '', brand: '', category: 'cpu', price: '', stock: '',
  description: '', imageUrl: '', isAvailable: true,
}

function ProductModal({ initial, onSave, onClose, busy }) {
  const [form, setForm] = useState(initial ?? EMPTY_PRODUCT)
  const update = (field, value) => setForm((c) => ({ ...c, [field]: value }))
  const isEdit = Boolean(initial?.id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-black text-slate-900">
            {isEdit ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <MdClose className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">ชื่อสินค้า *</span>
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
              placeholder="เช่น Intel Core i9-14900K"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">แบรนด์ *</span>
            <input
              value={form.brand}
              onChange={(e) => update('brand', e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
              placeholder="เช่น Intel, ASUS"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">หมวดหมู่</span>
            <select
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_TH[c] ?? c}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">ราคา (บาท) *</span>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
              placeholder="0"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">สต็อก (ชิ้น)</span>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => update('stock', e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
              placeholder="0"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">URL รูปภาพ</span>
            <input
              value={form.imageUrl}
              onChange={(e) => update('imageUrl', e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
              placeholder="https://..."
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">คำอธิบาย</span>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
              placeholder="รายละเอียดสินค้า"
            />
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) => update('isAvailable', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-blue-600"
            />
            <span className="text-sm font-semibold text-slate-700">แสดงสินค้า (เปิดขาย)</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
            ยกเลิก
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={busy || !form.name || !form.brand || !form.price}
            className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            <MdSave className="h-4 w-4" />
            {busy ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  )
}

function StaffDashboard() {
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [responses, setResponses] = useState({})

  // Product modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [productBusy, setProductBusy] = useState(false)
  const [productSuccess, setProductSuccess] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [orderList, inquiryList, productList] = await Promise.all([
        getOrders({ limit: 100 }),
        getAllInquiries({ limit: 100 }),
        fetchProducts({ limit: 200 }),
      ])
      setOrders(orderList.orders)
      setInquiries(inquiryList.inquiries)
      setProducts(productList.products)
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

  // Product CRUD
  const handleSaveProduct = async (form) => {
    setProductBusy(true)
    setProductSuccess('')
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock ?? 0),
      }
      if (form.id) {
        const updated = await updateProduct(form.id, payload)
        setProducts((cur) => cur.map((p) => (p.id === form.id ? updated : p)))
      } else {
        const created = await createProduct(payload)
        setProducts((cur) => [created, ...cur])
      }
      setModalOpen(false)
      setEditProduct(null)
      setProductSuccess(form.id ? 'อัปเดตสินค้าเรียบร้อย' : 'เพิ่มสินค้าเรียบร้อย')
      setTimeout(() => setProductSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'บันทึกสินค้าไม่สำเร็จ')
    } finally {
      setProductBusy(false)
    }
  }

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`ยืนยันการลบสินค้า "${name}"? การกระทำนี้ไม่สามารถย้อนกลับได้`)) return
    try {
      await deleteProduct(id)
      setProducts((cur) => cur.filter((p) => p.id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'ลบสินค้าไม่สำเร็จ')
    }
  }

  const tabButton = (id, label, Icon) => (
    <button
      onClick={() => setTab(id)}
      className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${tab === id ? 'bg-blue-700 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-blue-50'}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )

  return (
    <div className="rounded-3xl bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-sky-600">แดชบอร์ดพนักงาน</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">จัดการคำสั่งซื้อ การจัดส่ง และสินค้า</h1>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <MdRefresh className="h-5 w-5" />รีเฟรช
          </button>
        </header>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500">คำสั่งซื้อทั้งหมด</p>
            <p className="mt-2 text-2xl font-black text-blue-800">{loading ? '—' : orders.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500">รอดำเนินการ</p>
            <p className="mt-2 text-2xl font-black text-amber-600">{loading ? '—' : pendingCount}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500">คำถามที่ยังไม่ปิด</p>
            <p className="mt-2 text-2xl font-black text-indigo-600">{loading ? '—' : openInquiries}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500">สินค้าทั้งหมด</p>
            <p className="mt-2 text-2xl font-black text-emerald-600">{loading ? '—' : products.length}</p>
          </div>
        </section>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3">
          {tabButton('orders', 'คำสั่งซื้อ & จัดส่ง', MdLocalShipping)}
          {tabButton('inquiries', 'คำถามลูกค้า', MdQuestionAnswer)}
          {tabButton('products', 'จัดการสินค้า', MdInventory2)}
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">{error}</p>}
        {productSuccess && (
          <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 border border-emerald-100">
            <MdCheckCircle className="h-5 w-5" />{productSuccess}
          </p>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />)}
          </div>
        ) : tab === 'orders' ? (
          /* ─── Orders & Shipments ─── */
          <section className="space-y-4">
            {orders.length === 0 && (
              <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">ยังไม่มีคำสั่งซื้อ</p>
            )}
            {orders.map((order) => (
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
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor[order.status] ?? 'bg-slate-100 text-slate-600'}`}>
                    {ORDER_STATUS_TH[order.status] ?? order.status}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                  {/* Order status select */}
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-slate-600">สถานะ:</span>
                    <select
                      value={order.status}
                      disabled={busyId === order.id || order.status === 'CANCELLED'}
                      onChange={(e) => changeStatus(order.id, e.target.value)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-600 disabled:bg-slate-100"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{ORDER_STATUS_TH[s] ?? s}</option>
                      ))}
                    </select>
                  </label>

                  {/* Payment */}
                  {order.payment ? (
                    order.payment.status === 'PENDING' ? (
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

                  {/* Shipment */}
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
        ) : tab === 'inquiries' ? (
          /* ─── Inquiries ─── */
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
        ) : (
          /* ─── Products CRUD ─── */
          <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">จัดการสินค้า</h2>
                <p className="mt-1 text-sm text-slate-500">เพิ่ม แก้ไข หรือลบสินค้าออกจากระบบ</p>
              </div>
              <button
                onClick={() => { setEditProduct(null); setModalOpen(true) }}
                className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800 transition"
              >
                <MdAdd className="h-5 w-5" />เพิ่มสินค้าใหม่
              </button>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 pr-4 font-semibold">สินค้า</th>
                    <th className="pb-3 pr-4 font-semibold">หมวดหมู่</th>
                    <th className="pb-3 pr-4 font-semibold">ราคา</th>
                    <th className="pb-3 pr-4 font-semibold">สต็อก</th>
                    <th className="pb-3 pr-4 font-semibold">สถานะ</th>
                    <th className="pb-3 font-semibold">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-3 pr-4">
                        <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.brand}</p>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{CATEGORY_TH[p.category] ?? p.category}</td>
                      <td className="py-3 pr-4 font-semibold text-blue-800">{money(p.price)}</td>
                      <td className="py-3 pr-4">
                        <span className={`font-semibold ${p.stockQuantity <= 0 ? 'text-red-600' : p.stockQuantity < 5 ? 'text-amber-600' : 'text-slate-700'}`}>
                          {p.stockQuantity}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${p.inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                          {p.inStock ? 'เปิดขาย' : 'ปิดขาย'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditProduct(p); setModalOpen(true) }}
                            className="flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 transition"
                          >
                            <MdEdit className="h-3.5 w-3.5" />แก้ไข
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                          >
                            <MdDeleteOutline className="h-3.5 w-3.5" />ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-sm text-slate-400">ไม่พบสินค้าในระบบ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* Product Modal */}
      {modalOpen && (
        <ProductModal
          initial={editProduct}
          onSave={handleSaveProduct}
          onClose={() => { setModalOpen(false); setEditProduct(null) }}
          busy={productBusy}
        />
      )}
    </div>
  )
}

export default StaffDashboard
