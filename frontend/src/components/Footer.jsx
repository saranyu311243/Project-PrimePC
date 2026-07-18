import { Link } from 'react-router-dom'
import { MdLocationOn, MdPhone, MdEmail } from 'react-icons/md'

const productLinks = [
  { label: 'แล็ปท็อป & คอมพิวเตอร์', to: '/products?category=notebook' },
  { label: 'การ์ดจอ & ซีพียู', to: '/products?category=gpu' },
  { label: 'หูฟัง & เครื่องเสียง', to: '/products?category=headset' },
  { label: 'อุปกรณ์เสริม', to: '/products?category=accessory' },
]

const helpLinks = [
  { label: 'ติดต่อพนักงาน', to: '/contact' },
  { label: 'ติดตามพัสดุจัดส่ง', to: '/order-tracking' },
]

function Footer() {
  return (
    <footer className="mt-8 border-t-4 border-sky-500 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* แบรนด์ + คำโปรย */}
        <div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-black tracking-tight text-white">
              PRIME<span className="text-sky-400">PC</span>
            </p>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
            ศูนย์รวมคอมพิวเตอร์ อุปกรณ์ไอที และเกมมิ่งเกียร์ ในราคาที่เข้าถึงได้
          </p>
        </div>

        {/* สินค้า */}
        <div>
          <h2 className="font-bold text-white">สินค้า</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {productLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-slate-400 underline-offset-4 hover:text-sky-400 hover:underline">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ความช่วยเหลือ */}
        <div>
          <h2 className="font-bold text-white">ความช่วยเหลือ</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {helpLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-slate-400 underline-offset-4 hover:text-sky-400 hover:underline">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ติดต่อเรา */}
        <div>
          <h2 className="font-bold text-white">ติดต่อเรา</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <MdLocationOn className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" />
              <span>123 ถนนสุขุมวิท แขวงคลองเตย<br />เขตคลองเตย กรุงเทพฯ 10110</span>
            </li>
            <li className="flex items-center gap-2">
              <MdPhone className="h-5 w-5 shrink-0 text-sky-400" />
              <span>02-123-4567</span>
            </li>
            <li className="flex items-center gap-2">
              <MdEmail className="h-5 w-5 shrink-0 text-sky-400" />
              <span>support@primepc.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 px-4 py-5 text-center text-xs text-slate-500">
        © 2026 PrimePC. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
