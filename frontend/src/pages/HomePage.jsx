import { Link } from 'react-router-dom'
import heroImage from '../assets/primepc-hero.png'
import deliveryImage from '../assets/promo-delivery.png'
import gamingSetImage from '../assets/promo-gaming-set.png'
import notebookImage from '../assets/promo-notebook.png'

const promotions = [
  {
    title: 'ส่งไว มั่นใจทุกชิ้น',
    detail: 'จัดส่งฟรี เมื่อช้อปครบ 5,000 บาท',
    image: deliveryImage,
    alt: 'บริการจัดส่งคอมพิวเตอร์และอุปกรณ์',
  },
  {
    title: 'โน้ตบุ๊ก ราคาพิเศษ',
    detail: 'เลือกเครื่องที่ใช่สำหรับเรียนและทำงาน',
    image: notebookImage,
    alt: 'โน้ตบุ๊กพร้อมอุปกรณ์เกมมิ่ง',
  },
  {
    title: 'เกมมิ่งเซ็ตครบชุด',
    detail: 'จัดเต็มทุกอุปกรณ์ พร้อมเล่นทันที',
    image: gamingSetImage,
    alt: 'ชุดคอมพิวเตอร์เกมมิ่งครบชุด',
  },
]

function HomePage() {
  return (
    <div>
      <section className="relative min-h-[360px] overflow-hidden rounded-2xl bg-blue-950 shadow-xl sm:min-h-[430px]">
        <img
          src={heroImage}
          alt="ชุดคอมพิวเตอร์และอุปกรณ์เกมมิ่ง PrimePC"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-950/80 to-transparent" />

        <div className="relative z-10 flex min-h-[360px] max-w-xl flex-col justify-center px-7 py-12 text-white sm:min-h-[430px] sm:px-12">
          <span className="mb-4 w-fit rounded-full bg-sky-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
            PrimePC Mid Year Sale
          </span>
          <h1 className="text-3xl font-black leading-tight sm:text-5xl">
            อัปเกรดความแรง<br />ให้ทุกเกมของคุณ
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-blue-100 sm:text-base">
            รวมคอมประกอบและอุปกรณ์เกมมิ่ง ราคาพิเศษ พร้อมให้คุณเลือกสเปกที่ใช่ในสไตล์ของคุณ
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="rounded-lg bg-sky-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-sky-600"
            >
              เลือกซื้อสินค้า
            </Link>
            <Link
              to="/products?category=computer-set"
              className="rounded-lg border border-white/60 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white hover:text-blue-800"
            >
              ดูคอมจัดสเปก
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 md:grid-cols-3" aria-label="โปรโมชัน PrimePC">
        {promotions.map((promotion) => (
          <Link
            key={promotion.title}
            to="/products"
            className="group relative min-h-[210px] overflow-hidden rounded-xl bg-blue-950 shadow-md"
          >
            <img
              src={promotion.image}
              alt={promotion.alt}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-950/65 to-transparent" />
            <div className="relative z-10 flex h-full max-w-[65%] flex-col justify-center p-6 text-white">
              <p className="text-xl font-black leading-tight lg:text-2xl">{promotion.title}</p>
              <p className="mt-2 text-xs leading-5 text-blue-100 lg:text-sm">{promotion.detail}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-extrabold text-slate-900">
          PrimePC ศูนย์รวมคอมพิวเตอร์และอุปกรณ์ไอที
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          PrimePC ศูนย์รวมคอมพิวเตอร์และอุปกรณ์ไอทีครบวงจร คัดสรรสินค้าคุณภาพสำหรับทุกการใช้งาน ไม่ว่าจะเป็นคอมพิวเตอร์ประกอบ โน้ตบุ๊ก ซีพียู การ์ดจอ เมนบอร์ด หน่วยความจำ อุปกรณ์จัดเก็บข้อมูล รวมถึงเกมมิ่งเกียร์และอุปกรณ์เสริมอีกหลากหลายรายการ เราพร้อมช่วยให้คุณเลือกสเปกที่เหมาะกับงบประมาณ ทั้งสำหรับการเรียน การทำงาน การออกแบบ ตัดต่อวิดีโอ สตรีมมิง และเล่นเกม พร้อมโปรโมชันราคาคุ้มค่า บริการจัดส่งที่รวดเร็ว และการดูแลหลังการขาย เพื่อให้ทุกคนสามารถเป็นเจ้าของคอมพิวเตอร์ที่ตอบโจทย์ได้อย่างมั่นใจ
        </p>
      </section>
    </div>
  )
}

export default HomePage
