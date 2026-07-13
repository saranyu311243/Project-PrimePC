import { useEffect } from 'react'
import { Link } from 'react-router-dom'

function PaymentPage() {
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }) }, [])

  return (
    <div className="rounded-3xl bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="text-sm font-bold uppercase tracking-widest text-sky-600">ชำระเงิน</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">เลือกวิธีการชำระเงิน</h1>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">ชำระผ่านบัตรเครดิต / เดบิต</h2>
            <p className="mt-2 text-sm text-slate-600">กรอกข้อมูลบัตรของคุณ (mock)</p>
          </article>

          <article className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">โอนผ่านธนาคาร / พร้อมเพย์</h2>
            <p className="mt-2 text-sm text-slate-600">ข้อมูลบัญชีสำหรับโอน (mock)</p>
          </article>
        </section>

        <div className="flex items-center justify-end gap-3">
          <Link to="/checkout" className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700">กลับ</Link>
          <button className="rounded-2xl bg-blue-700 px-6 py-3 font-black text-white hover:bg-blue-800">ยืนยันการชำระเงิน</button>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage
