import { useEffect, useState } from 'react'

function OrderTrackingPage() {
  const [trackingId, setTrackingId] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }) }, [])

  const submit = (e) => { e.preventDefault(); setResult({ status: 'จัดส่งระหว่างทาง', eta: '1-2 วันทำการ' }) }

  return (
    <div className="rounded-3xl bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="text-sm font-bold uppercase tracking-widest text-sky-600">ติดตามพัสดุ</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">ติดตามคำสั่งซื้อของคุณ</h1>
        </header>

        <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-sm">
          <label className="text-sm font-semibold text-slate-700">รหัสติดตาม / หมายเลขคำสั่งซื้อ</label>
          <div className="mt-3 flex gap-3">
            <input value={trackingId} onChange={(e) => setTrackingId(e.target.value)} className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="เช่น ORD-2026-0001" />
            <button type="submit" className="rounded-2xl bg-blue-700 px-5 py-3 font-black text-white hover:bg-blue-800">ค้นหา</button>
          </div>
        </form>

        {result && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">สถานะล่าสุด</p>
            <h2 className="mt-2 text-xl font-black text-slate-900">{result.status}</h2>
            <p className="mt-1 text-sm text-slate-600">ประมาณการจัดส่ง: {result.eta}</p>
          </section>
        )}
      </div>
    </div>
  )
}

export default OrderTrackingPage
