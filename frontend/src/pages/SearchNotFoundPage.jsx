import { MdOutlineSearchOff } from 'react-icons/md'
import { Link, useSearchParams } from 'react-router-dom'

function SearchNotFoundPage() {
  const [searchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''

  return (
    <section className="grid min-h-[62vh] place-items-center px-4 py-16 text-center">
      <div className="max-w-xl">
        <MdOutlineSearchOff className="mx-auto h-20 w-20 text-sky-500" aria-hidden="true" />
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-blue-700">PrimePC Search</p>
        <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">ไม่พบสินค้าที่ค้นหา</h1>
        {search && <p className="mt-4 text-base text-slate-600">ไม่พบผลลัพธ์สำหรับ “{search}”</p>}
        <p className="mt-2 text-sm leading-6 text-slate-500">ลองตรวจสอบคำสะกด เปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นแล้วลองอีกครั้ง</p>
        <Link to="/" className="mt-7 inline-flex rounded-lg bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800">กลับหน้า Home</Link>
      </div>
    </section>
  )
}

export default SearchNotFoundPage
