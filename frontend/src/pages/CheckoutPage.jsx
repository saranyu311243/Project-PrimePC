import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const money = (value) => value.toLocaleString('th-TH', { minimumFractionDigits: 2 })

function CheckoutPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  return (
    <div className="rounded-3xl bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">เช็คเอาท์</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">ข้อมูลการจัดส่งและชำระเงิน</h1>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">นี่เป็นหน้า mock สำหรับกระบวนการชำระเงิน — ใช้สำหรับทดสอบ UI เท่านั้น</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">ชื่อ-นามสกุล</label>
              <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="ผู้รับ" />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">เบอร์ติดต่อ</label>
              <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="08x-xxx-xxxx" />
            </div>
            <div className="sm:col-span-2 space-y-3">
              <label className="text-sm font-semibold text-slate-700">ที่อยู่จัดส่ง</label>
              <textarea className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" rows={3} placeholder="ที่อยู่, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์" />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">ยอดสรุปสินค้าทั้งหมด</p>
              <p className="mt-1 text-2xl font-black text-blue-800">฿{money(2590)}</p>
            </div>
            <Link to="/payment" className="rounded-2xl bg-blue-700 px-6 py-3 font-black text-white hover:bg-blue-800">ไปยังการชำระเงิน</Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default CheckoutPage
