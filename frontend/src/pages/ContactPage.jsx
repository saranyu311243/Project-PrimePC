import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MdCheckCircle,
  MdEmail,
  MdPhone,
  MdAccessTime,
  MdLocationOn,
  MdFacebook,
  MdSupportAgent,
  MdSend,
} from 'react-icons/md'
import { createInquiry } from '../services/inquiryService'
import { useAuth } from '../hooks/useAuth'

const TOPICS = [
  { value: 'order', label: '📦 สอบถามเรื่องคำสั่งซื้อ' },
  { value: 'shipping', label: '🚚 สอบถามเรื่องการจัดส่ง' },
  { value: 'return', label: '🔄 การคืนสินค้า / รับประกัน' },
  { value: 'payment', label: '💳 ปัญหาการชำระเงิน' },
  { value: 'product', label: '💻 ข้อมูลสินค้า' },
  { value: 'other', label: '📝 อื่นๆ' },
]

const CONTACT_INFO = [
  {
    icon: MdPhone,
    title: 'โทรศัพท์',
    detail: '02-123-4567',
    sub: 'จันทร์–ศุกร์ 09:00–18:00',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
  },
  {
    icon: MdEmail,
    title: 'อีเมล',
    detail: 'support@primepc.th',
    sub: 'ตอบกลับภายใน 24 ชั่วโมง',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: MdLocationOn,
    title: 'ที่อยู่',
    detail: '88 ถ.พระราม 9 แขวงห้วยขวาง กรุงเทพฯ 10310',
    sub: 'ศูนย์บริการและโชว์รูม',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: MdAccessTime,
    title: 'เวลาทำการ',
    detail: 'จันทร์ – ศุกร์ 09:00–18:00',
    sub: 'เสาร์ 10:00–16:00 · อาทิตย์ปิดทำการ',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
]

function ContactPage() {
  const { isAuthenticated } = useAuth()
  const [topic, setTopic] = useState(TOPICS[0].value)
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
    const topicLabel = TOPICS.find((t) => t.value === topic)?.label ?? topic
    try {
      await createInquiry(`[${topicLabel}] ${text}`)
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
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header */}
        <header>
          <div className="flex items-center gap-2">
            <MdSupportAgent className="h-5 w-5 text-sky-600" />
            <p className="text-sm font-bold uppercase tracking-wide text-sky-600">ติดต่อเรา</p>
          </div>
          <h1 className="mt-2 text-3xl font-black text-slate-900">มีคำถามหรือปัญหา? บอกเราได้เลย</h1>
          <p className="mt-2 text-slate-500">ทีมงาน PrimePC พร้อมช่วยเหลือคุณทุกวัน</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">

          {/* ─── Contact Form ─── */}
          <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            {sent ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-emerald-50">
                  <MdCheckCircle className="h-12 w-12 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">ส่งข้อความเรียบร้อยแล้ว!</h2>
                <p className="max-w-sm text-sm text-slate-500">
                  ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง<br />
                  คุณสามารถตรวจสอบการตอบกลับได้ในภายหลัง
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-3 rounded-2xl bg-blue-700 px-6 py-3 font-black text-white hover:bg-blue-800 transition"
                >
                  ส่งข้อความใหม่
                </button>
              </div>
            ) : !isAuthenticated ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-blue-50">
                  <MdSupportAgent className="h-10 w-10 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">เข้าสู่ระบบเพื่อส่งข้อความ</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    กรุณาเข้าสู่ระบบก่อนส่งข้อความถึงทีมงาน<br />
                    เพื่อให้เราติดต่อกลับได้ถูกต้อง
                  </p>
                </div>
                <Link
                  to="/login"
                  state={{ from: '/contact' }}
                  className="mt-2 inline-flex rounded-2xl bg-blue-700 px-8 py-3 font-black text-white hover:bg-blue-800 transition"
                >
                  เข้าสู่ระบบ
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-black text-slate-900">ส่งข้อความหาเรา</h2>

                {/* Topic */}
                <div className="mt-5">
                  <label className="text-sm font-semibold text-slate-700">หัวข้อ</label>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {TOPICS.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setTopic(t.value)}
                        className={`rounded-xl border-2 px-4 py-2.5 text-left text-sm font-semibold transition ${
                          topic === t.value
                            ? 'border-blue-600 bg-blue-50 text-blue-800'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="mt-5">
                  <label className="text-sm font-semibold text-slate-700">ข้อความ</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500 transition"
                    rows={5}
                    maxLength={1000}
                    placeholder="อธิบายปัญหาหรือคำถามของคุณที่นี่..."
                  />
                  <div className="mt-1 text-right text-xs text-slate-400">{message.length}/1000</div>
                </div>

                {feedback && (
                  <p className="mt-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">{feedback}</p>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={send}
                    disabled={submitting}
                    className="flex items-center gap-2 rounded-2xl bg-blue-700 px-6 py-3 font-black text-white hover:bg-blue-800 disabled:bg-slate-300 transition"
                  >
                    <MdSend className="h-4 w-4" />
                    {submitting ? 'กำลังส่ง...' : 'ส่งข้อความ'}
                  </button>
                </div>
              </>
            )}
          </section>

          {/* ─── Contact Info ─── */}
          <div className="space-y-4">
            {CONTACT_INFO.map((info) => {
              const Icon = info.icon
              return (
                <div key={info.title} className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${info.bg}`}>
                    <Icon className={`h-5 w-5 ${info.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500">{info.title}</p>
                    <p className="mt-0.5 font-semibold text-slate-900">{info.detail}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{info.sub}</p>
                  </div>
                </div>
              )
            })}

            {/* Social */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
              <p className="text-sm font-bold text-slate-500">โซเชียลมีเดีย</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition"
                >
                  <MdFacebook className="h-5 w-5" />Facebook
                </a>
                <a
                  href="https://line.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-green-600 transition"
                >
                  <span className="font-black">LINE</span>@primepc
                </a>
              </div>
            </div>

            {/* FAQ hint */}
            <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center">
              <p className="text-sm font-semibold text-slate-600">มีคำถามเร่งด่วน?</p>
              <p className="mt-1 text-xs text-slate-400">โทรหาเราได้เลย ไม่ต้องรอตอบกลับ</p>
              <a
                href="tel:021234567"
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700 transition"
              >
                <MdPhone className="h-4 w-4" />02-123-4567
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
