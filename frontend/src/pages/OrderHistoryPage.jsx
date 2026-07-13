import { useEffect } from 'react'
import { Link } from 'react-router-dom'

function OrderHistoryPage() {
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }) }, [])

  const mockOrders = [
    { id: 'ORD-2026-0001', date: '2026-07-01', total: 2590, status: 'จัดส่งแล้ว' },
    { id: 'ORD-2026-0002', date: '2026-06-20', total: 1290, status: 'ยกเลิก' },
  ]

  return (
    <div className="rounded-3xl bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="text-sm font-bold uppercase tracking-wide text-sky-600">ประวัติคำสั่งซื้อ</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">รายการสั่งซื้อของฉัน</h1>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <ul className="space-y-4">
            {mockOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                <div>
                  <p className="font-bold text-slate-900">{o.id}</p>
                  <p className="text-sm text-slate-500">{o.date} • สถานะ: {o.status}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-blue-800">฿{o.total.toLocaleString('th-TH')}</p>
                  <Link to="/order-tracking" className="mt-2 inline-block text-sm text-slate-600">ติดตาม</Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

export default OrderHistoryPage
