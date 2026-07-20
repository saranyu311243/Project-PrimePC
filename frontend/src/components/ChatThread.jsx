import { useEffect, useRef, useState } from 'react'
import { MdSend } from 'react-icons/md'

const ROLE_TH = { STAFF: 'พนักงาน', ADMIN: 'ผู้ดูแลระบบ', CUSTOMER: 'ลูกค้า' }

const fmtTime = (value) =>
  value ? new Date(value).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : ''

/** Reusable chat-bubble thread + composer, shared by the customer chat page and staff dashboard. */
function ChatThread({ messages, currentUserId, onSend, sending, disabled, disabledNote, error }) {
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  const submit = async () => {
    const trimmed = text.trim()
    if (!trimmed || sending || disabled) return
    setText('')
    await onSend(trimmed)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">ยังไม่มีข้อความ</p>
        )}
        {messages.map((msg) => {
          const own = msg.sender?.id === currentUserId
          return (
            <div key={msg.id} className={`flex flex-col ${own ? 'items-end' : 'items-start'}`}>
              {!own && (
                <span className="mb-1 px-1 text-xs font-semibold text-slate-500">
                  {msg.sender?.name || 'ไม่ทราบชื่อ'} · {ROLE_TH[msg.sender?.role] ?? msg.sender?.role}
                </span>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  own ? 'rounded-tr-sm bg-blue-700 text-white' : 'rounded-tl-sm bg-slate-100 text-slate-800'
                }`}
              >
                <p className="whitespace-pre-line break-words">{msg.message}</p>
              </div>
              <span className="mt-1 px-1 text-[11px] text-slate-400">{fmtTime(msg.createdAt)}</span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className="mx-4 mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 border border-red-100">{error}</p>}

      {disabled ? (
        <p className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
          {disabledNote}
        </p>
      ) : (
        <div className="flex items-end gap-2 border-t border-slate-100 p-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="พิมพ์ข้อความ..."
            className="max-h-24 flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
          />
          <button
            type="button"
            onClick={submit}
            disabled={sending || !text.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50"
          >
            <MdSend className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default ChatThread
