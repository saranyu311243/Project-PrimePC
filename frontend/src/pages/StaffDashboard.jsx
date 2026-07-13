import { useEffect } from 'react'

function StaffDashboard() {
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }) }, [])

  return (
    <div className="rounded-3xl bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="text-sm font-bold uppercase tracking-wide text-sky-600">แดชบอร์ดพนักงาน</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">จัดการคำสั่งซื้อและสต็อก (Mock)</h1>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">คำสั่งซื้อรอดำเนินการ</p>
            <p className="mt-2 text-2xl font-black text-blue-800">12</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">สินค้าคงเหลือต่ำ</p>
            <p className="mt-2 text-2xl font-black text-blue-800">5</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">คำสั่งซื้อวันนี้</p>
            <p className="mt-2 text-2xl font-black text-blue-800">34</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default StaffDashboard
