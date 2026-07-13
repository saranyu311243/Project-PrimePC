import { useEffect } from 'react'

function AdminDashboard() {
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }) }, [])

  return (
    <div className="rounded-3xl bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="text-sm font-bold uppercase tracking-wide text-sky-600">แดชบอร์ดผู้ดูแล</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">จัดการผู้ใช้ ระบบ และรายงาน (Mock)</h1>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">ผู้ใช้ทั้งหมด</p>
            <p className="mt-2 text-2xl font-black text-blue-800">1,234</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">ยอดขายเดือนนี้</p>
            <p className="mt-2 text-2xl font-black text-blue-800">฿124,000</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">รายงานปัญหา</p>
            <p className="mt-2 text-2xl font-black text-blue-800">3</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminDashboard
