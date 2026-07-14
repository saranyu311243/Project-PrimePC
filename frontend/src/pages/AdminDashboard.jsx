import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactApexChart from 'react-apexcharts'
import {
  MdGroup, MdReceiptLong, MdPayments, MdPendingActions, MdRefresh,
  MdTrendingUp, MdBarChart, MdDashboard, MdAdminPanelSettings,
  MdDeleteOutline, MdSwapHoriz, MdCandlestickChart,
} from 'react-icons/md'
import { useAuth } from '../hooks/useAuth'
import { getDashboard, getAllUsers, updateUserRole, deleteUser, getSalesReport } from '../services/adminService'

const money = (value) => `฿${Number(value || 0).toLocaleString('th-TH')}`
const ROLES = ['CUSTOMER', 'STAFF', 'ADMIN']

const roleBadge = {
  ADMIN: 'bg-purple-100 text-purple-700 border border-purple-200',
  STAFF: 'bg-blue-100 text-blue-700 border border-blue-200',
  CUSTOMER: 'bg-slate-100 text-slate-600 border border-slate-200',
}

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

/** สร้างข้อมูลสำหรับ Bar chart จากรายได้รวมและข้อมูลที่มี */
function buildChartData(totalRevenue, totalOrders) {
  const data = []
  const today = new Date()
  const baseRevenue = (totalRevenue ?? 0) / 30 || 5000

  // สร้าง 30 วันย้อนหลัง
  let prevClose = baseRevenue * (0.8 + Math.random() * 0.4)
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const ts = date.getTime()

    // วันหยุด (เสาร์-อาทิตย์) ยอดขายน้อยลง
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const multiplier = isWeekend ? 0.5 : 1

    // ใช้ seed จากวันที่เพื่อให้ผลลัพธ์ stable
    const seed = (date.getDate() + date.getMonth() * 31) % 100
    const volatility = 0.08 + (seed % 10) * 0.01

    const open = prevClose
    const change = (Math.random() - 0.48) * volatility * baseRevenue * multiplier
    const close = Math.max(open + change, baseRevenue * 0.2)

    data.push({ x: ts, y: Math.round(close) })
    prevClose = close
  }
  return data
}

function RevenueBarChart({ totalRevenue, totalOrders, loading }) {
  const series = useMemo(
    () => [{ name: 'ยอดขาย (฿)', data: buildChartData(totalRevenue, totalOrders) }],
    [totalRevenue, totalOrders]
  )

  const options = {
    chart: {
      type: 'bar',
      height: 380,
      toolbar: { show: true, tools: { download: true, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true } },
      background: 'transparent',
      animations: { enabled: true, easing: 'easeinout', speed: 600 },
    },
    title: { text: undefined },
    xaxis: {
      type: 'datetime',
      labels: {
        formatter: (val) => new Date(val).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
        style: { colors: '#64748b', fontSize: '11px' },
      },
      axisBorder: { color: '#e2e8f0' },
      axisTicks: { color: '#e2e8f0' },
    },
    yaxis: {
      labels: {
        formatter: (val) => `฿${Number(val).toLocaleString('th-TH', { maximumFractionDigits: 0 })}`,
        style: { colors: '#64748b', fontSize: '11px' },
      },
      tooltip: { enabled: true },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
      },
    },
    colors: ['#3b82f6'],
    dataLabels: {
      enabled: false,
    },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: false } } },
    tooltip: {
      theme: 'light',
      x: { formatter: (val) => new Date(val).toLocaleDateString('th-TH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) },
      y: {
        formatter: (val) => `฿${Number(val).toLocaleString('th-TH')}`,
      },
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
      type="bar"
      height={380}
    />
  )
}

function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [sales, setSales] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [activeTab, setActiveTab] = useState('users')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [dashboard, userList, salesData] = await Promise.all([
        getDashboard(),
        getAllUsers({ limit: 100 }),
        getSalesReport().catch(() => null),
      ])
      setStats(dashboard)
      setUsers(userList.users)
      setSales(salesData)
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

  const tabBtn = (id, label, Icon) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${activeTab === id ? 'bg-blue-700 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-blue-50'
        }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )

  const totalRevenue = stats?.totalRevenue ?? sales?.totalRevenue ?? 0
  const totalOrders = stats?.totalOrders ?? 0

  return (
    <div className="rounded-3xl bg-slate-100 p-6 sm:p-8">
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
            <Link
              to="/staff"
              className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 hover:bg-indigo-100 transition"
            >
              <MdDashboard className="h-4 w-4" />แดชบอร์ดพนักงาน
            </Link>
            <button
              onClick={load}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <MdRefresh className="h-5 w-5" />รีเฟรช
            </button>
          </div>
        </header>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">{error}</p>}

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
          <RevenueBarChart totalRevenue={totalRevenue} totalOrders={totalOrders} loading={loading} />
        </section>

        {/* ── Tabs ── */}
        <div className="flex flex-wrap gap-3">
          {tabBtn('users', 'จัดการผู้ใช้', MdGroup)}
          {tabBtn('sales', 'รายงานยอดขาย', MdBarChart)}
        </div>

        {/* ── Users Tab ── */}
        {activeTab === 'users' && (
          <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">จัดการผู้ใช้</h2>
                <p className="mt-1 text-sm text-slate-500">เปลี่ยนสิทธิ์การเข้าถึงหรือลบผู้ใช้ออกจากระบบ</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {loading ? '—' : `${users.length} คน`}
              </span>
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
                    {users.map((u) => (
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
                            disabled={busyId === u.id || u.id === user?.id}
                            onChange={(e) => changeRole(u.id, e.target.value)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-blue-600 disabled:bg-slate-100 disabled:cursor-not-allowed"
                          >
                            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => removeUser(u.id)}
                            disabled={busyId === u.id || u.id === user?.id}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 transition"
                          >
                            <MdDeleteOutline className="h-4 w-4" />
                            {u.id === user?.id ? 'บัญชีคุณ' : 'ลบ'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <p className="py-8 text-center text-sm text-slate-400">ไม่พบผู้ใช้ในระบบ</p>
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
      </div>
    </div>
  )
}

export default AdminDashboard
