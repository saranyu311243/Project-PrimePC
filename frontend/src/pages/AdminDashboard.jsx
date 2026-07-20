import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactApexChart from 'react-apexcharts'
import {
  MdGroup, MdReceiptLong, MdPayments, MdPendingActions, MdRefresh,
  MdTrendingUp, MdBarChart, MdAdminPanelSettings,
  MdDeleteOutline, MdSwapHoriz, MdInventory2, MdLogout,
  MdAdd, MdEdit, MdCheckCircle, MdSearch, MdPersonAddAlt,
} from 'react-icons/md'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { useFavorites } from '../hooks/useFavorites'
import { getDashboard, getAllUsers, updateUserRole, deleteUser, getSalesReport, createStaffUser } from '../services/adminService'
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../services/productService'
import ProductModal from '../components/ProductModal'
import StaffModal from '../components/StaffModal'

const money = (value) => `฿${Number(value || 0).toLocaleString('th-TH')}`
const ROLES = ['CUSTOMER', 'STAFF', 'ADMIN']

const roleBadge = {
  ADMIN: 'bg-purple-100 text-purple-700 border border-purple-200',
  STAFF: 'bg-blue-100 text-blue-700 border border-blue-200',
  CUSTOMER: 'bg-slate-100 text-slate-600 border border-slate-200',
}

const CATEGORY_TH = {
  cpu: 'ซีพียู', motherboard: 'เมนบอร์ด', gpu: 'การ์ดจอ', ram: 'แรม',
  storage: 'อุปกรณ์จัดเก็บข้อมูล', psu: 'พาวเวอร์ซัพพลาย', cooling: 'ระบายความร้อน',
  notebook: 'โน้ตบุ๊ก', monitor: 'จอมอนิเตอร์', keyboard: 'คีย์บอร์ด',
  mouse: 'เมาส์', accessory: 'อุปกรณ์เสริม', case: 'เคส', headset: 'หูฟัง',
}

const PRODUCT_CATEGORIES = [
  'cpu', 'motherboard', 'gpu', 'ram', 'storage', 'psu',
  'cooling', 'notebook', 'monitor', 'keyboard', 'mouse',
  'accessory', 'case', 'headset',
]

const statCards = [
  {
    icon: MdGroup,
    label: 'ผู้ใช้ทั้งหมด',
    key: 'totalUsers',
    format: (v) => (v ?? 0).toLocaleString('th-TH'),
    gradient: 'from-blue-600 to-blue-800',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
  },
  {
    icon: MdReceiptLong,
    label: 'คำสั่งซื้อทั้งหมด',
    key: 'totalOrders',
    format: (v) => (v ?? 0).toLocaleString('th-TH'),
    gradient: 'from-sky-500 to-sky-700',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
  },
  {
    icon: MdPayments,
    label: 'รายได้รวม (ชำระแล้ว)',
    key: 'totalRevenue',
    format: money,
    gradient: 'from-emerald-500 to-emerald-700',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
  {
    icon: MdPendingActions,
    label: 'รอดำเนินการ',
    key: 'pendingOrders',
    format: (v) => (v ?? 0).toLocaleString('th-TH'),
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
  },
]

function StatCard({ icon: Icon, label, value, gradient, bg, text }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${bg}`}>
          <Icon className={`h-5 w-5 ${text}`} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-black text-slate-900">{value}</p>
      <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${gradient} opacity-60`} />
    </div>
  )
}

const PAID_STATUSES = ['PROCESSING', 'SHIPPING', 'DELIVERED']
const CANCELLED_STATUS = 'CANCELLED'

/** รวมยอดขายจริงรายวัน (7 วันล่าสุด) แยกเป็นชำระแล้ว/รอดำเนินการ/ยกเลิก จากออเดอร์จริง */
function buildDailyRevenueSeries(orders) {
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(d)
  }

  const paid = days.map(() => 0)
  const pending = days.map(() => 0)
  const cancelled = days.map(() => 0)

  for (const order of orders ?? []) {
    const orderDate = new Date(order.createdAt)
    orderDate.setHours(0, 0, 0, 0)
    const idx = days.findIndex((d) => d.getTime() === orderDate.getTime())
    if (idx === -1) continue

    const amount = Number(order.totalAmount || 0)
    if (order.status === CANCELLED_STATUS) cancelled[idx] += amount
    else if (PAID_STATUSES.includes(order.status)) paid[idx] += amount
    else pending[idx] += amount
  }

  const categories = days.map((d) => d.getTime())
  return { categories, paid, pending, cancelled }
}

// Categorical slots 1/2/3 from the validated palette (fixed order — see references/palette.md),
// checked with scripts/validate_palette.js for this exact 3-series combination.
const CHART_COLORS = ['#2a78d6', '#008300', '#e87ba4']

function RevenueTrendChart({ orders, loading }) {
  const { categories, paid, pending, cancelled } = useMemo(() => buildDailyRevenueSeries(orders), [orders])

  const series = [
    { name: 'ชำระแล้ว', data: paid },
    { name: 'รอดำเนินการ', data: pending },
    { name: 'ยกเลิก', data: cancelled },
  ]

  const options = {
    chart: {
      type: 'area',
      height: 380,
      toolbar: { show: true, tools: { download: true, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true } },
      background: 'transparent',
      animations: { enabled: true, easing: 'easeinout', speed: 600 },
    },
    colors: CHART_COLORS,
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 90, 100] },
    },
    markers: { size: 5, strokeWidth: 2, strokeColors: '#fcfcfb', hover: { size: 7 } },
    dataLabels: {
      enabled: true,
      formatter: (val) => Math.round(val).toLocaleString('th-TH'),
      style: { fontSize: '11px', fontWeight: 700, colors: ['#fff'] },
      background: { enabled: true, borderRadius: 8, padding: 6, opacity: 1, borderWidth: 0 },
      offsetY: -4,
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: '#52514e' },
      markers: { size: 6 },
    },
    xaxis: {
      type: 'datetime',
      categories,
      labels: {
        formatter: (val) => new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        style: { colors: '#898781', fontSize: '11px' },
      },
      axisBorder: { color: '#c3c2b7' },
      axisTicks: { color: '#c3c2b7' },
    },
    yaxis: {
      labels: {
        formatter: (val) => `฿${Number(val).toLocaleString('th-TH', { maximumFractionDigits: 0 })}`,
        style: { colors: '#898781', fontSize: '11px' },
      },
    },
    grid: { borderColor: '#e1e0d9', strokeDashArray: 4, xaxis: { lines: { show: false } } },
    tooltip: {
      theme: 'light',
      x: { formatter: (val) => new Date(val).toLocaleDateString('th-TH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) },
      y: { formatter: (val) => `฿${Number(val).toLocaleString('th-TH')}` },
    },
  }

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="space-y-3 w-full">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-4 animate-pulse rounded-lg bg-slate-100" />)}
        </div>
      </div>
    )
  }

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="area"
      height={380}
    />
  )
}

function AdminDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { clearCart } = useCart()
  const { clearFavorites } = useFavorites()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [sales, setSales] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [activeTab, setActiveTab] = useState('users')
  const [userSearch, setUserSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState('all')

  // Product modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [productBusy, setProductBusy] = useState(false)
  const [productSuccess, setProductSuccess] = useState('')

  // Staff creation modal state
  const [staffModalOpen, setStaffModalOpen] = useState(false)
  const [staffBusy, setStaffBusy] = useState(false)
  const [staffError, setStaffError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [dashboard, userList, salesData, productList] = await Promise.all([
        getDashboard(),
        getAllUsers({ limit: 100 }),
        getSalesReport().catch(() => null),
        fetchProducts({ limit: 200 }),
      ])
      setStats(dashboard)
      setUsers(userList.users)
      setSales(salesData)
      setProducts(productList.products)
    } catch (err) {
      setError(err.response?.data?.message || 'โหลดข้อมูลแดชบอร์ดไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch dashboard data on mount
    load()
  }, [])

  const changeRole = async (id, role) => {
    setBusyId(id)
    try {
      const updated = await updateUserRole(id, role)
      setUsers((current) => current.map((u) => (u.id === id ? { ...u, role: updated?.role ?? role } : u)))
    } catch (err) {
      setError(err.response?.data?.message || 'เปลี่ยนสิทธิ์ผู้ใช้ไม่สำเร็จ')
    } finally {
      setBusyId(null)
    }
  }

  const removeUser = async (id) => {
    if (!window.confirm('ยืนยันการลบผู้ใช้นี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) return
    setBusyId(id)
    try {
      await deleteUser(id)
      setUsers((current) => current.filter((u) => u.id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'ลบผู้ใช้ไม่สำเร็จ')
    } finally {
      setBusyId(null)
    }
  }

  const handleCreateStaff = async (form) => {
    setStaffBusy(true)
    setStaffError('')
    try {
      const created = await createStaffUser(form)
      setUsers((current) => [created, ...current])
      setStaffModalOpen(false)
      setProductSuccess('สร้างบัญชีพนักงานเรียบร้อย')
      setTimeout(() => setProductSuccess(''), 3000)
    } catch (err) {
      setStaffError(err.response?.data?.message || 'สร้างบัญชีพนักงานไม่สำเร็จ')
    } finally {
      setStaffBusy(false)
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

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
  }, [users, userSearch])

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase()
    return products
      .filter((p) => productCategoryFilter === 'all' || p.category === productCategoryFilter)
      .filter((p) => !q || p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q))
  }, [products, productSearch, productCategoryFilter])

  const productCountByCategory = useMemo(() => {
    const counts = {}
    for (const p of products) counts[p.category] = (counts[p.category] ?? 0) + 1
    return counts
  }, [products])

  const handleLogout = () => {
    clearCart()
    clearFavorites()
    logout()
    navigate('/login')
  }

  const sidebarNavItem = (id, label, Icon) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
        activeTab === id ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/10'
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  )

  const totalRevenue = stats?.totalRevenue ?? sales?.totalRevenue ?? 0

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="flex shrink-0 flex-col rounded-3xl bg-blue-900 p-4 text-white lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-64 lg:overflow-y-auto">
        <div className="px-2 pb-4 pt-1 text-2xl font-black italic tracking-tighter">
          PRIME<span className="text-sky-300">PC</span>
        </div>

        <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-widest text-blue-300">เมนูผู้ดูแลระบบ</p>
        <nav className="flex flex-col gap-1">
          {sidebarNavItem('users', 'จัดการผู้ใช้', MdGroup)}
          {sidebarNavItem('sales', 'รายงานยอดขาย', MdBarChart)}
          {sidebarNavItem('products', 'จัดการสินค้า', MdInventory2)}
        </nav>

        <div className="mt-auto pt-4">
          <div className="mb-2 border-t border-blue-800" />
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-blue-100 transition hover:bg-white/10 hover:text-white"
          >
            <MdLogout className="h-5 w-5" />ออกจากระบบ
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 rounded-3xl bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* ── Header ── */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MdAdminPanelSettings className="h-5 w-5 text-purple-600" />
              <p className="text-sm font-bold uppercase tracking-wide text-purple-600">แดชบอร์ดผู้ดูแลระบบ</p>
            </div>
            <h1 className="mt-2 text-3xl font-black text-slate-900">ภาพรวมระบบและการจัดการ</h1>
            <p className="mt-1 text-sm text-slate-500">ยินดีต้อนรับ, {user?.firstName || user?.name || 'ผู้ดูแล'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <MdRefresh className="h-5 w-5" />รีเฟรช
            </button>
          </div>
        </header>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">{error}</p>}
        {productSuccess && (
          <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 border border-emerald-100">
            <MdCheckCircle className="h-5 w-5" />{productSuccess}
          </p>
        )}

        {/* ── Stat Cards ── */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <StatCard
              key={card.key}
              icon={card.icon}
              label={card.label}
              value={loading ? '—' : card.format(stats?.[card.key])}
              gradient={card.gradient}
              bg={card.bg}
              text={card.text}
            />
          ))}
        </section>

        {/* ── Bar Chart ── */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <MdBarChart className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-black text-slate-900">กราฟยอดขายรายวัน</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">ติดตามยอดขาย 30 วันล่าสุดแบบรายวัน</p>
            </div>
          </div>
          <RevenueTrendChart orders={sales?.orders} loading={loading} />
        </section>

        {/* ── Users Tab ── */}
        {activeTab === 'users' && (
          <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">จัดการผู้ใช้</h2>
                <p className="mt-1 text-sm text-slate-500">เปลี่ยนสิทธิ์การเข้าถึงหรือลบผู้ใช้ออกจากระบบ</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative">
                  <MdSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="ค้นหาชื่อหรืออีเมล..."
                    className="w-56 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-sky-500"
                  />
                </label>
                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {loading ? '—' : `${filteredUsers.length} คน`}
                </span>
                <button
                  onClick={() => { setStaffError(''); setStaffModalOpen(true) }}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800 transition"
                >
                  <MdPersonAddAlt className="h-5 w-5" />เพิ่มพนักงานใหม่
                </button>
              </div>
            </div>

            {loading ? (
              <div className="mt-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="pb-3 pr-4 font-semibold">ผู้ใช้</th>
                      <th className="pb-3 pr-4 font-semibold">อีเมล</th>
                      <th className="pb-3 pr-4 font-semibold">สิทธิ์ปัจจุบัน</th>
                      <th className="pb-3 pr-4 font-semibold">
                        <span className="flex items-center gap-1"><MdSwapHoriz className="h-4 w-4" />เปลี่ยนสิทธิ์</span>
                      </th>
                      <th className="pb-3 font-semibold">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="py-3 pr-4 font-bold text-slate-900">{u.name || `ผู้ใช้ #${u.id}`}</td>
                        <td className="py-3 pr-4 text-slate-500">{u.email}</td>
                        <td className="py-3 pr-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${roleBadge[u.role] ?? 'bg-slate-100 text-slate-600'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <select
                            value={u.role}
                            disabled={busyId === u.id || u.id === user?.id || u.role === 'ADMIN'}
                            onChange={(e) => changeRole(u.id, e.target.value)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-blue-600 disabled:bg-slate-100 disabled:cursor-not-allowed"
                          >
                            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => removeUser(u.id)}
                            disabled={busyId === u.id || u.id === user?.id || u.role === 'ADMIN'}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 transition"
                          >
                            <MdDeleteOutline className="h-4 w-4" />
                            {u.id === user?.id ? 'บัญชีคุณ' : u.role === 'ADMIN' ? 'แอดมิน' : 'ลบ'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <p className="py-8 text-center text-sm text-slate-400">
                    {userSearch ? 'ไม่พบผู้ใช้ที่ตรงกับคำค้นหา' : 'ไม่พบผู้ใช้ในระบบ'}
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── Sales Report Tab ── */}
        {activeTab === 'sales' && (
          <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <MdTrendingUp className="h-6 w-6 text-emerald-600" />
              <div>
                <h2 className="text-xl font-black text-slate-900">รายงานยอดขาย</h2>
                <p className="text-sm text-slate-500">ภาพรวมยอดขายและรายได้ของร้าน</p>
              </div>
            </div>

            {loading ? (
              <div className="mt-6 space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />)}
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {/* Summary */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">ยอดขายรวม</p>
                    <p className="mt-2 text-2xl font-black text-emerald-700">{money(sales?.totalRevenue ?? totalRevenue)}</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-600">คำสั่งซื้อที่สำเร็จ</p>
                    <p className="mt-2 text-2xl font-black text-blue-700">{(sales?.completedOrders ?? 0).toLocaleString('th-TH')} รายการ</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-4 border border-amber-100">
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-600">มูลค่าเฉลี่ย/ออเดอร์</p>
                    <p className="mt-2 text-2xl font-black text-amber-700">
                      {sales?.completedOrders ? money((sales.totalRevenue ?? 0) / sales.completedOrders) : '฿0'}
                    </p>
                  </div>
                </div>

                {/* Top Products */}
                {Array.isArray(sales?.topProducts) && sales.topProducts.length > 0 ? (
                  <div>
                    <h3 className="mb-3 font-bold text-slate-700">สินค้าขายดี</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[480px] text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500">
                            <th className="pb-2 pr-4 text-left font-semibold">สินค้า</th>
                            <th className="pb-2 pr-4 text-right font-semibold">จำนวนที่ขาย</th>
                            <th className="pb-2 text-right font-semibold">รายได้</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sales.topProducts.map((p, i) => (
                            <tr key={p.productId ?? i} className="border-b border-slate-100">
                              <td className="py-2.5 pr-4 font-medium text-slate-800">{p.productName ?? `สินค้า #${p.productId}`}</td>
                              <td className="py-2.5 pr-4 text-right text-slate-600">{(p.totalQuantity ?? 0).toLocaleString('th-TH')}</td>
                              <td className="py-2.5 text-right font-bold text-emerald-700">{money(p.totalRevenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 p-8 text-center border border-slate-200">
                    <MdBarChart className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-3 text-sm text-slate-500">ยังไม่มีข้อมูลสินค้าขายดีในช่วงนี้</p>
                    <p className="mt-1 text-xs text-slate-400">ข้อมูลรายได้รวมแสดงด้านบน</p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── Products Tab ── */}
        {activeTab === 'products' && (
          <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">จัดการสินค้า</h2>
                <p className="mt-1 text-sm text-slate-500">เพิ่ม แก้ไข หรือลบสินค้าออกจากระบบ</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative">
                  <MdSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="ค้นหาชื่อหรือแบรนด์..."
                    className="w-56 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-sky-500"
                  />
                </label>
                <button
                  onClick={() => { setEditProduct(null); setModalOpen(true) }}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800 transition"
                >
                  <MdAdd className="h-5 w-5" />เพิ่มสินค้าใหม่
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setProductCategoryFilter('all')}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${productCategoryFilter === 'all' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                ทั้งหมด ({products.length})
              </button>
              {PRODUCT_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setProductCategoryFilter(c)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${productCategoryFilter === c ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {CATEGORY_TH[c]} ({productCountByCategory[c] ?? 0})
                </button>
              ))}
            </div>

            {loading ? (
              <div className="mt-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="pb-3 pr-4 font-semibold">รูป</th>
                      <th className="pb-3 pr-4 font-semibold">สินค้า</th>
                      <th className="pb-3 pr-4 font-semibold">หมวดหมู่</th>
                      <th className="pb-3 pr-4 font-semibold">ราคา</th>
                      <th className="pb-3 pr-4 font-semibold">สต็อก</th>
                      <th className="pb-3 pr-4 font-semibold">สถานะ</th>
                      <th className="pb-3 font-semibold">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="py-3 pr-4">
                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                            {p.image_url ? (
                              <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">{p.icon}</span>
                            )}
                          </div>
                        </td>
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
                  </tbody>
                </table>
                {filteredProducts.length === 0 && (
                  <p className="py-8 text-center text-sm text-slate-400">
                    {productSearch || productCategoryFilter !== 'all' ? 'ไม่พบสินค้าที่ตรงกับเงื่อนไข' : 'ไม่พบสินค้าในระบบ'}
                  </p>
                )}
              </div>
            )}
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

      {/* Staff Modal */}
      {staffModalOpen && (
        <StaffModal
          onSave={handleCreateStaff}
          onClose={() => setStaffModalOpen(false)}
          busy={staffBusy}
          error={staffError}
        />
      )}
      </div>
    </div>
  )
}

export default AdminDashboard
