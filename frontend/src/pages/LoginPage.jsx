import { useState } from 'react'
import { FaFacebookF, FaGoogle } from 'react-icons/fa'
import { MdLockOutline, MdMailOutline, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const submit = async (event) => {
    event.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(form.email) || form.password.length < 6) {
      setMessage('กรุณากรอกอีเมลให้ถูกต้องและรหัสผ่านอย่างน้อย 6 ตัวอักษร')
      return
    }
    setSubmitting(true)
    setMessage('')
    try {
      const account = await login(form.email, form.password)
      // Route by role so staff/admin land on their dashboards.
      if (account?.role === 'ADMIN') navigate('/admin')
      else if (account?.role === 'STAFF') navigate('/staff')
      else navigate('/')
    } catch (error) {
      setMessage(error.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative hidden min-h-[640px] overflow-hidden bg-gradient-to-br from-blue-950 via-blue-800 to-sky-500 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[50px] border-white/10" />
        <p className="relative text-3xl font-black italic">PRIME<span className="text-sky-300">PC</span></p>
        <div className="relative"><p className="text-sm font-bold uppercase tracking-[0.25em] text-sky-200">Welcome back</p><h1 className="mt-4 text-4xl font-black leading-tight">เข้าสู่โลกของ<br />คอมพิวเตอร์ที่ใช่</h1><p className="mt-5 max-w-sm leading-7 text-blue-100">จัดการตะกร้า ติดตามคำสั่งซื้อ และรับสิทธิพิเศษสำหรับสมาชิก PrimePC</p></div>
      </div>

      <div className="flex min-h-[640px] items-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="w-full">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-600">PRIMEPC ACCOUNT</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">เข้าสู่ระบบ</h1>
          <p className="mt-2 text-sm text-slate-500">ยินดีต้อนรับกลับมา กรุณากรอกข้อมูลบัญชีของคุณ</p>
          {location.state?.registrationSuccess && <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ</p>}

          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block"><span className="text-sm font-bold text-slate-700">อีเมล</span><span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-300 px-4 focus-within:border-blue-600"><MdMailOutline className="h-5 w-5 text-slate-400" /><input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="name@example.com" className="w-full py-3.5 outline-none" /></span></label>
            <label className="block"><span className="text-sm font-bold text-slate-700">รหัสผ่าน</span><span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-300 px-4 focus-within:border-blue-600"><MdLockOutline className="h-5 w-5 text-slate-400" /><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="อย่างน้อย 6 ตัวอักษร" className="w-full py-3.5 outline-none" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-400" aria-label="แสดงหรือซ่อนรหัสผ่าน">{showPassword ? <MdVisibilityOff /> : <MdVisibility />}</button></span></label>
            <div className="flex items-center justify-between gap-4 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={form.remember} onChange={(event) => update('remember', event.target.checked)} className="h-4 w-4 accent-blue-700" />จดจำฉัน</label><Link to="/forgot-password" className="font-semibold text-blue-700 hover:underline">ลืมรหัสผ่าน?</Link></div>
            {message && <p className={`rounded-lg px-4 py-3 text-sm ${message.includes('สำเร็จ') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{message}</p>}
            <button type="submit" disabled={submitting} className="w-full rounded-xl bg-blue-700 py-3.5 font-black text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300">{submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</button>
          </form>

          <div className="my-6 flex items-center gap-4 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />หรือเข้าสู่ระบบด้วย<span className="h-px flex-1 bg-slate-200" /></div>
          <div className="grid gap-3 sm:grid-cols-2"><button type="button" className="flex items-center justify-center gap-3 rounded-xl bg-[#1877f2] py-3 font-bold text-white"><FaFacebookF />Facebook</button><button type="button" className="flex items-center justify-center gap-3 rounded-xl border border-slate-300 py-3 font-bold text-slate-700 hover:bg-slate-50"><FaGoogle className="text-red-500" />Google</button></div>
          <p className="mt-7 text-center text-sm text-slate-500">ยังไม่มีบัญชี? <Link to="/register" className="font-bold text-blue-700 hover:underline">สมัครสมาชิก</Link></p>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
