import { MdError, MdClose } from 'react-icons/md'
import { Link } from 'react-router-dom'

function LoginRequiredToast({ onClose }) {
  return (
    <div className="fixed left-1/2 top-24 z-[100] flex min-w-64 -translate-x-1/2 items-center gap-3 rounded-xl border border-red-100 bg-white px-4 py-3 text-sm shadow-2xl">
      <MdError className="h-5 w-5 shrink-0 text-red-500" />
      <span className="text-slate-600">กรุณา <Link to="/login" className="font-bold text-blue-700 hover:underline">Login</Link></span>
      <button type="button" onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-700" aria-label="ปิดข้อความ"><MdClose /></button>
    </div>
  )
}

export default LoginRequiredToast
