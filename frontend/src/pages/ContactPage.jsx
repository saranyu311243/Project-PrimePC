import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MdCheckCircle } from 'react-icons/md'
import { createInquiry } from '../services/inquiryService'
import { useAuth } from '../hooks/useAuth'

function ContactPage() {
  const { isAuthenticated } = useAuth()
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }) }, [])

  const send = async () => {
    setFeedback('')
    const text = message.trim()
    if (!text) {
      setFeedback('กรุณาพิมพ์ข้อความก่อนส่ง')
      return
    }
    if (text.length > 1000) {
      setFeedback('ข้อความต้องไม่เกิน 1000 ตัวอักษร')
      return
    }
    setSubmitting(true)
    try {
      await createInquiry(text)
      setSent(true)
      setMessage('')
    } catch (err) {
      setFeedback(err.response?.data?.message || 'ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-3xl bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="text-sm font-bold uppercase tracking-wide text-sky-600">ติดต่อเรา</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">มีคำถามหรือปัญหา บอกเราได้เลย</h1>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <MdCheckCircle className="h-16 w-16 text-emerald-500" />
              <h2 className="text-2xl font-black text-slate-900">ส่งข้อความเรียบร้อยแล้ว</h2>
              <p className="text-sm text-slate-500">ทีมงานจะติดต่อกลับโดยเร็วที่สุด คุณสามารถติดตามการตอบกลับได้ในภายหลัง</p>
              <button onClick={() => setSent(false)} className="mt-3 rounded-2xl bg-blue-700 px-6 py-3 font-black text-white hover:bg-blue-800">ส่งข้อความใหม่</button>
            </div>
          ) : !isAuthenticated ? (
            <div className="py-6 text-center">
              <p className="text-slate-600">กรุณาเข้าสู่ระบบก่อนส่งข้อความถึงทีมงาน เพื่อให้เราติดต่อกลับได้</p>
              <Link to="/login" state={{ from: '/contact' }} className="mt-5 inline-flex rounded-2xl bg-blue-700 px-6 py-3 font-black text-white hover:bg-blue-800">เข้าสู่ระบบ</Link>
            </div>
          ) : (
            <>
              <label className="text-sm font-semibold text-slate-700">ข้อความ</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-500"
                rows={6}
                maxLength={1000}
                placeholder="พิมพ์ข้อความของคุณที่นี่"
              />
              <div className="mt-1 text-right text-xs text-slate-400">{message.length}/1000</div>
              {feedback && <p className="mt-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{feedback}</p>}
              <div className="mt-4 flex justify-end">
                <button onClick={send} disabled={submitting} className="rounded-2xl bg-blue-700 px-6 py-3 font-black text-white hover:bg-blue-800 disabled:bg-slate-300">
                  {submitting ? 'กำลังส่ง...' : 'ส่งข้อความ'}
                </button>
              </div>
            </>
          )}
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
