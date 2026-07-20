import { useState } from 'react'
import { MdClose, MdSave } from 'react-icons/md'

const EMPTY_STAFF = { name: '', email: '', password: '', phone: '' }

function StaffModal({ onSave, onClose, busy, error }) {
  const [form, setForm] = useState(EMPTY_STAFF)

  const update = (field, value) => setForm((c) => ({ ...c, [field]: value }))

  const isValid = form.name.trim() && form.email.trim() && form.password.length >= 8

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-black text-slate-900">เพิ่มพนักงานใหม่</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <MdClose className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">{error}</p>}

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">ชื่อ-นามสกุล *</span>
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
              placeholder="ชื่อพนักงาน"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">อีเมล *</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
              placeholder="staff@primepc.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">รหัสผ่าน * (อย่างน้อย 8 ตัวอักษร)</span>
            <input
              type="text"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
              placeholder="ตั้งรหัสผ่านให้พนักงาน"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">เบอร์โทร (10 หลัก, ถ้ามี)</span>
            <input
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
              placeholder="0812345678"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
            ยกเลิก
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={busy || !isValid}
            className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            <MdSave className="h-4 w-4" />
            {busy ? 'กำลังสร้าง...' : 'สร้างบัญชีพนักงาน'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default StaffModal
