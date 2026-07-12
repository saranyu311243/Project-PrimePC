import { MdFavorite } from 'react-icons/md'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'
import { useFavorites } from '../hooks/useFavorites'

function FavoritePage() {
  const { favoriteIds } = useFavorites()
  const favoriteProducts = products.filter((product) => favoriteIds.includes(product.id))

  return (
    <div>
      <div className="flex items-center gap-3"><MdFavorite className="h-9 w-9 text-red-500" /><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">MY PRIMEPC</p><h1 className="text-3xl font-black text-slate-900">สินค้าที่ชื่นชอบ</h1></div></div>
      {favoriteProducts.length ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{favoriteProducts.map((product) => <ProductCard key={product.id} product={product} variant="listing" />)}</div>
      ) : (
        <section className="mt-8 grid min-h-96 place-items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><div><MdFavorite className="mx-auto h-16 w-16 text-slate-200" /><h2 className="mt-4 text-2xl font-black">ยังไม่มีสินค้าที่ชื่นชอบ</h2><p className="mt-2 text-slate-500">กดรูปหัวใจบนสินค้าที่สนใจเพื่อเก็บไว้ในหน้านี้</p><Link to="/products?category=cpu" className="mt-6 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-bold text-white">เลือกดูสินค้า</Link></div></section>
      )}
    </div>
  )
}

export default FavoritePage
