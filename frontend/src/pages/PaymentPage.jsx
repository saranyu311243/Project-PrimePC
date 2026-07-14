import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MdCheckCircle, MdCreditCard, MdAccountBalance, MdQrCode2, MdPayments } from 'react-icons/md'
import { useCart } from '../hooks/useCart'
import { getPaymentOptions, createPayment } from '../services/paymentService'

const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })

// Backend method value -> Thai label + icon
const methodMeta = {
  credit_card: { label: 'บัตรเครดิต / เดบิต', icon: MdCreditCard },
  bank_transfer: { label: 'โอนผ่านธนาคาร', icon: MdAccountBalance },
  paypal: { label: 'PayPal', icon: MdPayments },
  qr_code: { label: 'QR พร้อมเพย์', icon: MdQrCode2 },
}

function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { clearCart } = useCart()
  const orderId = location.state?.orderId
  const amount = location.state?.amount

  const [methods, setMethods] = useState([])
  const [selected, setSelected] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  // No order in state means the user landed here directly — send them to the cart.
  useEffect(() => {
    if (!orderId) navigate('/cart', { replace: true })
  }, [orderId, navigate])

  useEffect(() => {
    let active = true
    getPaymentOptions()
      .then((options) => {
        if (!active) return
        setMethods(options)
        setSelected(options[0] ?? '')
      })
      .catch(() => {
        if (active) setMethods(['credit_card', 'bank_transfer', 'qr_code'])
      })
    return () => {
      active = false
    }
  }, [])

  const pay = async () => {
    setError('')
    if (!selected) {
      setError('กรุณาเลือกวิธีการชำระเงิน')
      return
    }
    setSubmitting(true)
    try {
      await createPayment({ orderId, amount, method: selected })
      clearCart()
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.message || 'การชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl bg-slate-100 p-6 sm:p-8">
        <section className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow-sm">
          <MdCheckCircle className="mx-auto h-20 w-20 text-emerald-500" />
          <h1 className="mt-5 text-3xl font-black text-slate-900">สั่งซื้อสำเร็จ</h1>
          <p className="mt-3 text-slate-600">คำสั่งซื้อ #{orderId} ถูกบันทึกแล้ว รอการยืนยันการชำระเงินจากทีมงาน</p>
          <div className="mt-8 flex justify-center gap-3">
            <button onClick={() => navigate('/orders')} className="rounded-2xl bg-blue-700 px-6 py-3 font-black text-white hover:bg-blue-800">ดูประวัติคำสั่งซื้อ</button>
            <button onClick={() => navigate('/')} className="rounded-2xl border border-slate-300 px-6 py-3 font-bold text-slate-700 hover:bg-slate-50">กลับหน้าหลัก</button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="rounded-3xl bg-slate-100 p-6 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="text-sm font-bold uppercase tracking-widest text-sky-600">ชำระเงิน</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">เลือกวิธีการชำระเงิน</h1>
          <p className="mt-2 text-sm text-slate-500">คำสั่งซื้อ #{orderId} · ยอดชำระ ฿{money(amount)}</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {methods.map((method) => {
            const meta = methodMeta[method] ?? { label: method, icon: MdPayments }
            const Icon = meta.icon
            const active = selected === method
            return (
              <button
                key={method}
                type="button"
                onClick={() => setSelected(method)}
                className={`flex items-center gap-4 rounded-2xl border-2 bg-white p-6 text-left shadow-sm transition ${active ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent hover:border-slate-200'}`}
              >
                <Icon className={`h-8 w-8 ${active ? 'text-blue-700' : 'text-slate-400'}`} />
                <span className="font-bold text-slate-900">{meta.label}</span>
              </button>
            )
          })}
        </section>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-end gap-3">
          <button onClick={() => navigate('/cart')} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700">กลับไปที่ตะกร้า</button>
          <button onClick={pay} disabled={submitting} className="rounded-2xl bg-blue-700 px-6 py-3 font-black text-white hover:bg-blue-800 disabled:bg-slate-300">
            {submitting ? 'กำลังดำเนินการ...' : `ยืนยันการชำระเงิน ฿${money(amount)}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage
