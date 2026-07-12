import { useMemo, useState } from 'react'
import { MdKeyboardArrowRight, MdOutlineSearch } from 'react-icons/md'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { categories } from '../data/categories'
import { categoryFilterDefinitions, categoryHeaders, categorySearchAliases, homeBrandOptions } from '../data/productListConfig'
import { products } from '../data/products'

function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategory = searchParams.get('category') ?? 'cpu'
  const navbarSearch = searchParams.get('search') ?? ''
  const [searchText, setSearchText] = useState('')
  const [brands, setBrands] = useState([])
  const [availability, setAvailability] = useState([])
  const [filters, setFilters] = useState({})
  const [price, setPrice] = useState({ min: 0, max: null })
  const sortBy = searchParams.get('sort') ?? 'price-asc'

  const eligibleProducts = useMemo(() => products.filter((product) =>
    product.category === selectedCategory && homeBrandOptions.includes(product.brand.toUpperCase())), [selectedCategory])
  const maxPrice = Math.max(...eligibleProducts.map((product) => product.price), 1000)
  const currentMax = price.max ?? maxPrice
  const brandOptions = homeBrandOptions.filter((brand) => eligibleProducts.some((product) => product.brand.toUpperCase() === brand))
  const definitions = useMemo(() => categoryFilterDefinitions[selectedCategory] ?? [], [selectedCategory])

  const filteredProducts = useMemo(() => {
    const activeSearch = searchText.trim() || navbarSearch
    const tokens = activeSearch.toLowerCase().split(/\s+/).filter(Boolean)
    return eligibleProducts.filter((product) => {
      const haystack = [product.name, product.brand, product.description, product.categoryName, product.icon, ...(categorySearchAliases[product.category] ?? [])].join(' ').toLowerCase()
      const stock = product.inStock ? 'in-stock' : 'out-of-stock'
      const matchesCustom = definitions.every((definition) => {
        const selected = filters[definition.field] ?? []
        if (!selected.length) return true
        if (definition.match === 'includes') return selected.some((value) => String(product[definition.field] ?? '').toLowerCase().includes(String(value).toLowerCase()))
        return selected.includes(product[definition.field])
      })
      return tokens.every((token) => haystack.includes(token)) &&
        (!brands.length || brands.includes(product.brand.toUpperCase())) &&
        (!availability.length || availability.includes(stock)) && matchesCustom &&
        product.price >= price.min && product.price <= currentMax
    }).sort((a, b) => sortBy === 'price-desc' ? b.price - a.price : a.price - b.price)
  }, [availability, brands, currentMax, definitions, eligibleProducts, filters, navbarSearch, price.min, searchText, sortBy])

  const toggle = (value, list, setter) => setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value])
  const toggleFilter = (field, value) => setFilters((current) => {
    const list = current[field] ?? []
    return { ...current, [field]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value] }
  })
  const clearFilters = () => { setBrands([]); setAvailability([]); setFilters({}); setPrice({ min: 0, max: null }) }
  const updateSort = (value) => { const next = new URLSearchParams(searchParams); value === 'price-asc' ? next.delete('sort') : next.set('sort', value); setSearchParams(next) }
  const category = categories.find((item) => item.id === selectedCategory)
  const header = categoryHeaders[selectedCategory]

  return <div>
    {header && <section className="mb-8">
      <div className="relative min-h-[290px] overflow-hidden rounded-xl bg-white shadow-sm">
        <img src={header.image} alt={header.alt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent" />
        <div className="relative flex min-h-[290px] max-w-xl flex-col justify-center px-8 sm:px-12">
          <span className="text-sm font-bold tracking-[0.2em] text-blue-700">CATEGORY</span>
          <h1 className="mt-2 text-4xl font-black text-slate-950">{header.title}</h1>
          <p className="mt-2 text-lg font-bold text-blue-700">{header.thaiTitle}</p>
        </div>
      </div>
      <h2 className="mt-6 text-xl font-extrabold text-slate-800">{header.heading}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{header.description}</p>
    </section>}

    <div className="mb-6 flex items-end justify-between"><div><p className="text-sm font-bold text-sky-600">PRIMEPC PRODUCTS</p><h2 className="text-3xl font-black">{category?.name}</h2></div><p className="text-sm font-semibold">พบ {filteredProducts.length} รายการ</p></div>
    <div className="mb-7 flex gap-3 border border-slate-200 bg-white p-4 shadow-sm">
      <label className="flex flex-1 items-center gap-3 border border-slate-200 px-4"><MdOutlineSearch className="text-slate-400" /><input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="ค้นหาชื่อสินค้า แบรนด์ หรือรายละเอียด" className="w-full py-3 text-sm outline-none" /></label>
      <select value={sortBy} onChange={(e) => updateSort(e.target.value)} className="border border-slate-200 px-4 text-sm font-semibold outline-none"><option value="price-asc">ราคาต่ำไปสูง</option><option value="price-desc">ราคาสูงไปต่ำ</option></select>
    </div>

    <div className="grid items-start gap-7 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex justify-between"><h2 className="font-extrabold">เลือกการแสดงสินค้า</h2><button onClick={clearFilters} className="text-xs font-semibold text-blue-700">ล้างทั้งหมด</button></div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">{[['in-stock','มีในสต๊อก'],['out-of-stock','ไม่มีในสต๊อก']].map(([value,label]) => <label key={value} className="flex items-center gap-2"><input type="checkbox" checked={availability.includes(value)} onChange={() => toggle(value, availability, setAvailability)} className="h-5 w-5 accent-blue-700" />{label}</label>)}</div>
        <div className="mt-5 border-t border-slate-100 pt-4"><h3 className="text-sm font-semibold">ช่วงราคา</h3><div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2"><input type="number" min="0" max={currentMax} value={price.min} onChange={(e) => setPrice({ ...price, min: Math.min(currentMax, Math.max(0, Number(e.target.value))) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none" /><span>–</span><input type="number" min={price.min} max={maxPrice} value={currentMax} onChange={(e) => setPrice({ ...price, max: Math.max(price.min, Math.min(maxPrice, Number(e.target.value))) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none" /></div><input type="range" min={price.min} max={maxPrice} step="100" value={currentMax} onChange={(e) => setPrice({ ...price, max: Number(e.target.value) })} className="price-range mt-4 w-full accent-sky-500" /></div>
        <details open className="group mt-5 border-t border-slate-100 pt-4"><summary className="flex cursor-pointer list-none justify-between text-sm font-semibold text-slate-500">Brand<MdKeyboardArrowRight className="h-5 w-5 transition group-open:rotate-90" /></summary><div className="mt-4 space-y-3">{brandOptions.map((brand) => <label key={brand} className="flex gap-3 text-sm"><input type="checkbox" checked={brands.includes(brand)} onChange={() => toggle(brand, brands, setBrands)} className="h-5 w-5 accent-blue-700" />{brand}</label>)}</div></details>
        {definitions.map((definition) => <details key={definition.field} className="group mt-4 border-t border-slate-100 pt-4"><summary className="flex cursor-pointer list-none justify-between text-sm font-semibold text-slate-500">{definition.label}<MdKeyboardArrowRight className="h-5 w-5 transition group-open:rotate-90" /></summary><div className="mt-4 space-y-3">{definition.options.map((option) => <label key={option} className="flex gap-3 text-sm"><input type="checkbox" checked={(filters[definition.field] ?? []).includes(option)} onChange={() => toggleFilter(definition.field, option)} className="h-5 w-5 accent-blue-700" />{definition.field === 'continuousPower' ? `${option} Watt` : option}</label>)}</div></details>)}
      </aside>
      <section aria-live="polite">{filteredProducts.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} variant="listing" />)}</div> : <div className="grid min-h-80 place-items-center bg-white p-8 text-center shadow-sm"><p className="text-xl font-extrabold">ไม่พบสินค้าที่ค้นหา</p></div>}</section>
    </div>
  </div>
}

export default ProductListPage
