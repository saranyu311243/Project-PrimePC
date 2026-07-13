import { useEffect, useState } from 'react'

function ContactPage() {
  const [message, setMessage] = useState('')
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }) }, [])

  return (
    <div className="rounded-3xl bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="text-sm font-bold uppercase tracking-wide text-sky-600">ติดต่อเรา</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">มีคำถามหรือปัญหา บอกเราได้เลย</h1>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <label className="text-sm font-semibold text-slate-700">ข้อความ</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" rows={6} placeholder="พิมพ์ข้อความของคุณที่นี่" />
          <div className="mt-4 flex justify-end">
            <button className="rounded-2xl bg-blue-700 px-6 py-3 font-black text-white hover:bg-blue-800">ส่งข้อความ</button>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">ข้อมูลการติดต่อ</h2>
          <p className="mt-2 text-sm text-slate-600">อีเมล: support@primepc.example • โทร: 02-123-4567</p>
        </section>
      </div>
    </div>
  )
}

export default ContactPage
