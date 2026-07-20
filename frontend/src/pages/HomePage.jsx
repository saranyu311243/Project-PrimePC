import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MdOutlineAssignmentTurnedIn,
  MdOutlineLocalShipping,
  MdOutlineRecommend,
  MdOutlineTimer,
  MdOutlineVerifiedUser,
  MdOutlineWidgets,
} from 'react-icons/md'
import CategoryIcon from '../components/CategoryIcon'
import ProductCard from '../components/ProductCard'
import heroImage from '../assets/banners/primepc-hero.png'
import cpuWideImage from '../assets/banners/promo-cpu-wide.png'
import deliveryImage from '../assets/banners/promo-delivery.png'
import gamingSetImage from '../assets/banners/promo-gaming-set.png'
import notebookImage from '../assets/banners/promo-notebook.png'
import { categories } from '../data/categories'
import { brands } from '../data/brands'
import { useProducts } from '../hooks/useProducts'

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

const sidebarCategoryIds = [
  'cpu',
  'motherboard',
  'gpu',
  'ram',
  'psu',
  'mouse',
  'keyboard',
  'monitor',
  'accessory',
  'cooling',
]

const sidebarCategories = sidebarCategoryIds.map((id) =>
  categories.find((category) => category.id === id),
)

const serviceHighlights = [
  { title: 'ส่งฟรีทั่วไทย', detail: 'เมื่อช้อปครบ 5,000 บาทขึ้นไป', icon: MdOutlineLocalShipping },
  { title: 'เปลี่ยนคืนสินค้าง่าย', detail: 'เปลี่ยนสินค้าใหม่ภายใน 7 วัน', icon: MdOutlineAssignmentTurnedIn },
  { title: 'รวดเร็วในการให้บริการ', detail: 'พร้อมให้คำแนะนำอย่างใส่ใจ', icon: MdOutlineTimer },
  { title: 'ชำระเงินปลอดภัย', detail: 'มั่นใจด้วยระบบชำระเงินออนไลน์', icon: MdOutlineVerifiedUser },
]

function HomePage() {
  const [selectedFeaturedCategory, setSelectedFeaturedCategory] = useState('cpu')
  const { products } = useProducts()
  const homeBrandNames = new Set(brands.map((brand) => brand.id.toUpperCase()))
  const featuredProducts = products.filter(
    (product) =>
      product.category === selectedFeaturedCategory &&
      homeBrandNames.has(product.brand?.toUpperCase()),
  )
  const featuredProductsUrl = `/products?category=${selectedFeaturedCategory}`

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
            <a
              href="#featured-products"
              className="rounded-lg border border-white/60 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white hover:text-blue-800"
            >
              สินค้าแนะนำ
            </a>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 md:grid-cols-3" aria-label="โปรโมชัน PrimePC">
        {promotions.map((promotion) => (
          <article
            key={promotion.title}
            className="relative min-h-[210px] overflow-hidden rounded-xl bg-blue-950 shadow-md"
          >
            <img
              src={promotion.image}
              alt={promotion.alt}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-950/65 to-transparent" />
            <div className="relative z-10 flex h-full max-w-[65%] flex-col justify-center p-6 text-white">
              <p className="text-xl font-black leading-tight lg:text-2xl">{promotion.title}</p>
              <p className="mt-2 text-xs leading-5 text-blue-100 lg:text-sm">{promotion.detail}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-10" aria-label="แบรนด์สินค้า">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/products?brand=${brand.id.toUpperCase()}`}
              className="group grid min-h-12 place-items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-md"
            >
              <span
                className="text-base font-black tracking-tight transition duration-300 group-hover:scale-110 sm:text-lg"
                style={{ color: brand.color }}
              >
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="category-heading">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid grid-cols-2 gap-1" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-sm bg-sky-500" />
            <span className="h-2.5 w-2.5 rounded-sm bg-blue-700" />
            <span className="h-2.5 w-2.5 rounded-sm bg-blue-700" />
            <span className="h-2.5 w-2.5 rounded-sm bg-sky-500" />
          </span>
          <h2 id="category-heading" className="text-xl font-extrabold text-slate-900">
            หมวดหมู่สินค้า
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          <Link
            to="/products"
            className="group flex min-h-20 items-center gap-3 rounded-xl border border-transparent bg-gradient-to-br from-blue-700 to-sky-500 px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/20 text-2xl font-bold text-white transition group-hover:bg-white/30 group-hover:scale-110" aria-hidden="true">
              <MdOutlineWidgets />
            </span>
            <span className="text-sm font-bold text-white">
              สินค้าทั้งหมด
            </span>
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group flex min-h-20 items-center gap-3 rounded-xl border border-transparent bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-2xl font-bold text-blue-800 transition group-hover:bg-blue-700 group-hover:text-white" aria-hidden="true">
                <CategoryIcon name={category.icon} />
              </span>
              <span className="text-sm font-bold text-slate-700 transition group-hover:text-blue-700">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="featured-products" className="mt-16 scroll-mt-28" aria-labelledby="featured-products-heading">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 id="featured-products-heading" className="flex items-center gap-3 text-2xl font-black text-slate-900">
            <MdOutlineRecommend className="h-7 w-7 text-sky-500" aria-hidden="true" />
            แนะนำสินค้า
          </h2>
          <Link to={featuredProductsUrl} className="text-sm font-bold text-blue-700 hover:text-sky-500">
            ดูทั้งหมด <span aria-hidden="true">▶</span>
          </Link>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[230px_1fr]">
          <aside className="space-y-2 border border-slate-200 bg-white p-3 shadow-sm" aria-label="เลือกหมวดหมู่สินค้าแนะนำ">
            {sidebarCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedFeaturedCategory(category.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold transition ${
                  selectedFeaturedCategory === category.id
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <span className="grid w-6 place-items-center text-lg" aria-hidden="true">
                  <CategoryIcon name={category.icon} className="h-5 w-5" />
                </span>
                {category.name}
              </button>
            ))}
          </aside>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative mt-12 min-h-[230px] overflow-hidden rounded-xl bg-slate-950 shadow-lg sm:min-h-[260px]" aria-label="โปรโมชันซีพียู PrimePC">
        <img
          src={cpuWideImage}
          alt="ซีพียูประสิทธิภาพสูงบนเมนบอร์ด"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-slate-950/85 to-transparent" />
        <div className="relative z-10 flex min-h-[230px] max-w-2xl flex-col justify-center px-7 py-10 text-white sm:min-h-[260px] sm:px-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-400">PrimePC Performance</p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
            ปลดล็อกพลังประมวลผล<br />อัปเกรดให้แรงกว่าเดิม
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300">
            เลือกซีพียูประสิทธิภาพสูงสำหรับเล่นเกม ทำงาน และสร้างสรรค์ผลงาน พร้อมตัวเลือกที่เหมาะกับทุกงบประมาณ
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="จุดเด่นบริการ PrimePC">
        {serviceHighlights.map((service) => {
          const Icon = service.icon

          return (
            <div key={service.title} className="flex min-h-28 items-center gap-4 border border-slate-200 bg-white px-5 py-5 shadow-sm">
              <Icon className="h-11 w-11 shrink-0 text-slate-500" aria-hidden="true" />
              <div>
                <h3 className="text-base font-extrabold text-slate-800">{service.title}</h3>
                <p className="mt-1 text-sm leading-5 text-slate-500">{service.detail}</p>
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}

export default HomePage
