import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="mt-16 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="text-2xl font-black tracking-tight text-white">
            PRIME<span className="text-sky-400">PC</span>
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            ศูนย์รวมคอมพิวเตอร์ อุปกรณ์ไอที และเกมมิ่งเกียร์ ในราคาที่เข้าถึงได้
          </p>
        </div>

        <div>
          <h2 className="font-bold text-white">เลือกซื้อสินค้า</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link to="/products" className="hover:text-sky-400">สินค้าทั้งหมด</Link>
            <Link to="/products?category=cpu" className="hover:text-sky-400">ซีพียู</Link>
            <Link to="/products?category=gpu" className="hover:text-sky-400">การ์ดจอ</Link>
          </div>
        </div>

        <div>
          <h2 className="font-bold text-white">บัญชีของฉัน</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link to="/login" className="hover:text-sky-400">เข้าสู่ระบบ</Link>
            <Link to="/register" className="hover:text-sky-400">สมัครสมาชิก</Link>
            <Link to="/profile" className="hover:text-sky-400">โปรไฟล์ลูกค้า</Link>
          </div>
        </div>

        <div>
          <h2 className="font-bold text-white">ติดต่อเรา</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <p>โทร: 02-000-0000</p>
            <p>อีเมล: support@primepc.example</p>
            <p>เปิดบริการทุกวัน 09:00–20:00 น.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 px-4 py-5 text-center text-xs text-slate-500">
        © 2026 PrimePC. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
