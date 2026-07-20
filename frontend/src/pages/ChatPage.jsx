import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MdSupportAgent, MdAddComment, MdSend, MdRefresh } from 'react-icons/md'
import { useAuth } from '../hooks/useAuth'
import { getInquiries, createInquiry } from '../services/inquiryService'
import ChatThread from '../components/ChatThread'

const STATUS_TH = {
  PENDING: { label: 'รอตอบกลับ', className: 'bg-amber-100 text-amber-700' },
  RESPONDED: { label: 'ตอบกลับแล้ว', className: 'bg-emerald-100 text-emerald-700' },
  CLOSED: { label: 'ปิดแล้ว', className: 'bg-slate-200 text-slate-600' },
}

const previewOf = (message) => (message.length > 60 ? `${message.slice(0, 60)}…` : message)

const fmtShort = (value) =>
  value ? new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : ''

// สร้างรายการข้อความ (คำถามลูกค้า + คำตอบพนักงานถ้ามี) จากฟิลด์เดิมของ inquiry
// ตัวนี้เป็นแค่คู่ถาม-ตอบเดียว ไม่ใช่เธรดคุยไปมาได้เรื่อยๆ — ถ้าอยากถามต่อให้เริ่มแชทใหม่
const buildMessages = (inquiry) => {
  if (!inquiry) return []
  const list = [
    { id: 'q', message: inquiry.message, createdAt: inquiry.createdAt, sender: inquiry.user ?? { id: null, name: 'คุณ', role: 'CUSTOMER' } },
  ]
  if (inquiry.response) {
    list.push({ id: 'r', message: inquiry.response, createdAt: inquiry.updatedAt, sender: { id: null, name: 'ทีมงาน', role: 'STAFF' } })
  }
  return list
}

function NewChatComposer({ onCreate, busy, error }) {
  const [text, setText] = useState('')

  const submit = async () => {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    await onCreate(trimmed)
    setText('')
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-blue-50">
        <MdAddComment className="h-9 w-9 text-blue-600" />
      </div>
      <div>
        <h3 className="font-black text-slate-900">เริ่มการสนทนาใหม่</h3>
        <p className="mt-1 text-sm text-slate-500">พิมพ์คำถามหรือปัญหาที่ต้องการสอบถามทีมงาน</p>
      </div>
      <div className="w-full max-w-md space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="เช่น สอบถามเรื่องสถานะคำสั่งซื้อ..."
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-600"
        />
        {error && <p className="text-left text-xs font-semibold text-red-600">{error}</p>}
        <button
          onClick={submit}
          disabled={busy || !text.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50"
        >
          <MdSend className="h-4 w-4" />
          {busy ? 'กำลังส่ง...' : 'ส่งข้อความ'}
        </button>
      </div>
    </div>
  )
}

function ChatPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [inquiries, setInquiries] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [composingNew, setComposingNew] = useState(false)
  const [composeError, setComposeError] = useState('')
  const [composeBusy, setComposeBusy] = useState(false)

  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }) }, [])

  const loadInquiries = async ({ keepSelection = false } = {}) => {
    setListLoading(true)
    setListError('')
    try {
      const list = await getInquiries()
      setInquiries(list)
      if (!keepSelection) {
        if (list.length > 0) {
          setSelectedId(list[0].id)
          setComposingNew(false)
        } else {
          setComposingNew(true)
        }
      }
    } catch (err) {
      setListError(err.response?.data?.message || 'โหลดรายการสนทนาไม่สำเร็จ')
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch inquiries on mount
    loadInquiries()
  }, [isAuthenticated])

  const selectedInquiry = inquiries.find((i) => i.id === selectedId) ?? null

  const selectInquiry = (id) => {
    setComposingNew(false)
    setSelectedId(id)
  }

  const startNewChat = () => {
    setComposeError('')
    setSelectedId(null)
    setComposingNew(true)
  }

  const handleCreateInquiry = async (text) => {
    setComposeBusy(true)
    setComposeError('')
    try {
      const created = await createInquiry(text)
      setInquiries((cur) => [created, ...cur])
      setComposingNew(false)
      setSelectedId(created.id)
    } catch (err) {
      setComposeError(err.response?.data?.message || 'ส่งข้อความไม่สำเร็จ')
    } finally {
      setComposeBusy(false)
    }
  }

  if (authLoading) return null

  return (
    <div className="rounded-3xl bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MdSupportAgent className="h-5 w-5 text-sky-600" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-sky-600">แชทกับทีมงาน</p>
              <h1 className="text-2xl font-black text-slate-900">การสนทนาของฉัน</h1>
            </div>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => loadInquiries({ keepSelection: true })}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <MdRefresh className="h-4 w-4" />รีเฟรช
            </button>
          )}
        </header>

        {!isAuthenticated ? (
          <section className="rounded-2xl bg-white p-10 text-center shadow-sm border border-slate-100">
            <h2 className="text-xl font-black text-slate-900">เข้าสู่ระบบเพื่อดูแชท</h2>
            <p className="mt-2 text-sm text-slate-500">กรุณาเข้าสู่ระบบก่อนเพื่อคุยกับทีมงาน</p>
            <Link
              to="/login"
              state={{ from: '/chat' }}
              className="mt-5 inline-flex rounded-2xl bg-blue-700 px-8 py-3 font-black text-white hover:bg-blue-800 transition"
            >
              เข้าสู่ระบบ
            </Link>
          </section>
        ) : (
          <section className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 lg:h-[70vh] lg:flex-row">
            {/* Conversation list */}
            <aside className="flex max-h-64 shrink-0 flex-col border-b border-slate-100 lg:h-full lg:max-h-none lg:w-72 lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between border-b border-slate-100 p-3">
                <h2 className="text-sm font-black text-slate-900">การสนทนา</h2>
                <button
                  onClick={startNewChat}
                  className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                >
                  <MdAddComment className="h-4 w-4" />ใหม่
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {listLoading ? (
                  <div className="space-y-2 p-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}
                  </div>
                ) : listError ? (
                  <p className="p-4 text-center text-xs text-red-600">{listError}</p>
                ) : inquiries.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-400">ยังไม่มีการสนทนา</p>
                ) : (
                  inquiries.map((inq) => {
                    const status = STATUS_TH[inq.status] ?? { label: inq.status, className: 'bg-slate-100 text-slate-600' }
                    return (
                      <button
                        key={inq.id}
                        onClick={() => selectInquiry(inq.id)}
                        className={`block w-full border-b border-slate-50 p-3 text-left transition hover:bg-slate-50 ${
                          !composingNew && selectedId === inq.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-2 text-sm font-semibold text-slate-800">{previewOf(inq.message)}</p>
                          <span className="shrink-0 text-[10px] text-slate-400">{fmtShort(inq.createdAt)}</span>
                        </div>
                        <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${status.className}`}>
                          {status.label}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            </aside>

            {/* Thread */}
            <div className="min-h-0 flex-1">
              {composingNew ? (
                <NewChatComposer onCreate={handleCreateInquiry} busy={composeBusy} error={composeError} />
              ) : !selectedInquiry ? (
                <div className="flex h-full items-center justify-center p-8 text-center text-sm text-slate-400">
                  เลือกการสนทนาทางซ้าย หรือเริ่มแชทใหม่
                </div>
              ) : (
                <ChatThread
                  messages={buildMessages(selectedInquiry)}
                  currentUserId={user?.id}
                  disabled
                  disabledNote={'มีคำถามเพิ่มเติม? กดปุ่ม "ใหม่" ด้านบนเพื่อเริ่มการสนทนาใหม่'}
                />
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default ChatPage
