import { useEffect, useState } from 'react'
import { MdGroup, MdReceiptLong, MdPayments, MdPendingActions, MdRefresh } from 'react-icons/md'
import { useAuth } from '../hooks/useAuth'
import { getDashboard, getAllUsers, updateUserRole, deleteUser } from '../services/adminService'

const money = (value) => `฿${Number(value || 0).toLocaleString('th-TH')}`
const ROLES = ['CUSTOMER', 'STAFF', 'ADMIN']

const roleBadge = {
  ADMIN: 'bg-purple-100 text-purple-700',
  STAFF: 'bg-blue-100 text-blue-700',
  CUSTOMER: 'bg-slate-100 text-slate-600',
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700"><Icon className="h-6 w-6" /></span>
        <p className="text-sm text-slate-600">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-black text-slate-900">{value}</p>
    </div>
  )
}

function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [dashboard, userList] = await Promise.all([getDashboard(), getAllUsers({ limit: 100 })])
      setStats(dashboard)
      setUsers(userList.users)
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

  return (
    <div className="rounded-3xl bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-sky-600">แดชบอร์ดผู้ดูแล</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">ภาพรวมระบบและการจัดการผู้ใช้</h1>
          </div>
          <button onClick={load} className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
            <MdRefresh className="h-5 w-5" />รีเฟรช
          </button>
        </header>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={MdGroup} label="ผู้ใช้ทั้งหมด" value={loading ? '—' : (stats?.totalUsers ?? 0).toLocaleString('th-TH')} />
          <StatCard icon={MdReceiptLong} label="คำสั่งซื้อทั้งหมด" value={loading ? '—' : (stats?.totalOrders ?? 0).toLocaleString('th-TH')} />
          <StatCard icon={MdPayments} label="รายได้รวม (ชำระแล้ว)" value={loading ? '—' : money(stats?.totalRevenue)} />
          <StatCard icon={MdPendingActions} label="รอดำเนินการ" value={loading ? '—' : (stats?.pendingOrders ?? 0).toLocaleString('th-TH')} />
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">จัดการผู้ใช้</h2>
          <p className="mt-1 text-sm text-slate-500">เปลี่ยนสิทธิ์การเข้าถึงหรือลบผู้ใช้ออกจากระบบ</p>

          {loading ? (
            <p className="mt-6 text-sm text-slate-500">กำลังโหลด...</p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 pr-4 font-semibold">ผู้ใช้</th>
                    <th className="pb-3 pr-4 font-semibold">อีเมล</th>
                    <th className="pb-3 pr-4 font-semibold">สิทธิ์</th>
                    <th className="pb-3 pr-4 font-semibold">เปลี่ยนสิทธิ์</th>
                    <th className="pb-3 font-semibold">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-bold text-slate-900">{u.name}</td>
                      <td className="py-3 pr-4 text-slate-600">{u.email}</td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${roleBadge[u.role] ?? 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <select
                          value={u.role}
                          disabled={busyId === u.id || u.id === user?.id}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-600 disabled:bg-slate-100"
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => removeUser(u.id)}
                          disabled={busyId === u.id || u.id === user?.id}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {u.id === user?.id ? 'บัญชีคุณ' : 'ลบ'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminDashboard
