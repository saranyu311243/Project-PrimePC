import { useState } from 'react'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { Link, useNavigate } from 'react-router-dom'

const initialForm = { firstName: '', lastName: '', phone: '', birthDate: '', email: '', password: '', confirmPassword: '', accept: false }

function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState('')
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const submit = (event) => {
    event.preventDefault()
    if (!form.firstName || !form.lastName || !form.birthDate || !/^0\d{9}$/.test(form.phone) || !/^\S+@\S+\.\S+$/.test(form.email)) return setMessage('กรุณากรอกชื่อ วันเกิด เบอร์โทรศัพท์ และอีเมลให้ถูกต้อง')
    if (form.password.length < 6) return setMessage('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
    if (form.password !== form.confirmPassword) return setMessage('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน')
    if (!form.accept) return setMessage('กรุณายอมรับข้อกำหนดการใช้งาน')
    localStorage.setItem('primepc-profile', JSON.stringify({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      birthDate: form.birthDate,
    }))
    navigate('/login', { state: { registrationSuccess: true } })
  }

  const passwordInput = (field, label, visible, setVisible) => (
    <label className="block"><span className="text-sm font-bold text-slate-700">{label}</span><span className="mt-2 flex items-center rounded-xl border border-slate-300 px-4 focus-within:border-blue-600"><input type={visible ? 'text' : 'password'} value={form[field]} onChange={(event) => update(field, event.target.value)} placeholder={label} className="w-full py-3.5 outline-none" /><button type="button" onClick={() => setVisible((value) => !value)} className="text-slate-400" aria-label={`แสดงหรือซ่อน${label}`}>{visible ? <MdVisibilityOff /> : <MdVisibility />}</button></span></label>
  )

  return (
    <section className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="bg-gradient-to-r from-blue-950 via-blue-800 to-sky-500 px-8 py-10 text-white sm:px-14"><p className="text-sm font-bold uppercase tracking-[0.22em] text-sky-200">JOIN PRIMEPC</p><h1 className="mt-2 text-4xl font-black">สมัครสมาชิก</h1><p className="mt-3 text-blue-100">สร้างบัญชีเพื่อรับสิทธิพิเศษและติดตามคำสั่งซื้อได้สะดวกขึ้น</p></div>
      <form onSubmit={submit} className="register-form-grid gap-x-7 gap-y-7 p-8 sm:p-14">
        <label className="block"><span className="text-sm font-bold text-slate-700">ชื่อ</span><input value={form.firstName} onChange={(event) => update('firstName', event.target.value)} placeholder="ชื่อ" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-blue-600" /></label>
        <label className="block"><span className="text-sm font-bold text-slate-700">นามสกุล</span><input value={form.lastName} onChange={(event) => update('lastName', event.target.value)} placeholder="นามสกุล" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-blue-600" /></label>
        <label className="block"><span className="text-sm font-bold text-slate-700">เบอร์โทรศัพท์</span><input type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="0XX-XXX-XXXX" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-blue-600" /></label>
        <label className="block"><span className="text-sm font-bold text-slate-700">วันเกิด</span><input type="date" value={form.birthDate} onChange={(event) => update('birthDate', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-blue-600" /></label>
        <label className="register-full block"><span className="text-sm font-bold text-slate-700">อีเมล</span><input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="name@example.com" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-4 outline-none focus:border-blue-600" /></label>
        <div>{passwordInput('password', 'รหัสผ่าน', showPassword, setShowPassword)}</div>
        <div>{passwordInput('confirmPassword', 'ยืนยันรหัสผ่าน', showConfirmPassword, setShowConfirmPassword)}</div>
        <label className="register-full flex items-start gap-3 border-t border-slate-200 pt-6 text-sm leading-6 text-slate-600"><input type="checkbox" checked={form.accept} onChange={(event) => update('accept', event.target.checked)} className="mt-1 h-4 w-4 accent-blue-700" /><span>ฉันยอมรับข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัวของ PrimePC</span></label>
        {message && <p className={`register-full rounded-lg px-4 py-3 text-sm ${message.includes('สำเร็จ') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{message}</p>}
        <button type="submit" className="register-full rounded-xl bg-blue-700 py-4 font-black text-white hover:bg-blue-800">สมัครสมาชิก</button>
        <p className="register-full text-center text-sm text-slate-500">มีบัญชีอยู่แล้ว? <Link to="/login" className="font-bold text-blue-700 hover:underline">เข้าสู่ระบบ</Link></p>
      </form>
    </section>
  )
}

export default RegisterPage
