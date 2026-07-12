import { useState } from 'react'
import { MdArrowBack, MdContactMail, MdLockReset, MdMarkEmailRead } from 'react-icons/md'
import { Link } from 'react-router-dom'

function ForgotPasswordPage() {
  const [contact, setContact] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const submit = (event) => {
    event.preventDefault()
    const value = contact.trim()
    const isEmail = /^\S+@\S+\.\S+$/.test(value)
    const isPhone = /^0\d{9}$/.test(value.replace(/[-\s]/g, ''))
    if (!isEmail && !isPhone) {
      setError('กรุณากรอกอีเมลหรือเบอร์โทรศัพท์ 10 หลักให้ถูกต้อง')
      setSent(false)
      return
    }
    setError('')
    setSent(true)
  }

  return (
    <section className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="bg-gradient-to-r from-blue-950 via-blue-800 to-sky-500 px-8 py-10 text-white sm:px-12">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15"><MdLockReset className="h-8 w-8" /></div>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-sky-200">PRIMEPC ACCOUNT</p>
        <h1 className="mt-2 text-4xl font-black">ลืมรหัสผ่าน</h1>
        <p className="mt-3 leading-7 text-blue-100">กรอกอีเมลหรือเบอร์โทรศัพท์ที่ใช้สมัครสมาชิก เพื่อรับลิงก์หรือรหัสสำหรับตั้งรหัสผ่านใหม่</p>
      </div>

      <div className="p-8 sm:p-12">
        {sent ? (
          <div className="text-center">
            <MdMarkEmailRead className="mx-auto h-20 w-20 text-emerald-500" />
            <h2 className="mt-5 text-2xl font-black text-slate-900">ส่งข้อมูลรีเซ็ตรหัสผ่านแล้ว</h2>
            <p className="mt-3 leading-7 text-slate-500">กรุณาตรวจสอบข้อความที่ส่งไปยัง <strong className="text-slate-700">{contact}</strong> และทำตามขั้นตอนที่ได้รับ</p>
            <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">ขณะนี้เป็นระบบ Mock จึงยังไม่มีอีเมลหรือ SMS ส่งออกจริง</p>
            <button type="button" onClick={() => setSent(false)} className="mt-6 w-full rounded-xl border-2 border-blue-700 py-3.5 font-bold text-blue-700 hover:bg-blue-50">ใช้ช่องทางอื่น</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label className="block"><span className="text-sm font-bold text-slate-700">อีเมล หรือ เบอร์โทรศัพท์</span><span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-300 px-4 focus-within:border-blue-600"><MdContactMail className="h-5 w-5 text-slate-400" /><input type="text" value={contact} onChange={(event) => setContact(event.target.value)} placeholder="กรอกอีเมล หรือ เบอร์โทรศัพท์" className="w-full py-4 outline-none" /></span></label>
            {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
            <button type="submit" className="mt-6 w-full rounded-xl bg-blue-700 py-4 font-black text-white hover:bg-blue-800">ส่งข้อมูลรีเซ็ตรหัสผ่าน</button>
          </form>
        )}

        <Link to="/login" className="mt-7 flex items-center justify-center gap-2 text-sm font-bold text-blue-700 hover:underline"><MdArrowBack />กลับไปหน้าเข้าสู่ระบบ</Link>
      </div>
    </section>
  )
}

export default ForgotPasswordPage
