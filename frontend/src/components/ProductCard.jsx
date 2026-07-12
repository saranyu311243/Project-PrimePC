import { Link } from 'react-router-dom'
import { MdFavoriteBorder } from 'react-icons/md'

function ProductCard({ product, variant = 'default' }) {
  if (variant === 'listing') {
    return (
      <article className="group relative flex min-h-[430px] flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-lg">
        <span className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-bold ${product.inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-700 text-white'}`}>
          {product.inStock ? 'มีสินค้า' : 'สินค้าหมด'}
        </span>
        <button
          type="button"
          className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:text-red-500"
          aria-label={`เพิ่ม ${product.name} ไปยังรายการโปรด`}
        >
          <MdFavoriteBorder className="h-6 w-6" />
        </button>

        <Link to={`/products/${product.id}`} className="flex h-full flex-1 flex-col">
          <div className="grid min-h-56 place-items-center overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 p-5">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="h-full w-full object-contain" />
            ) : (
              <div className="grid h-28 w-40 place-items-center border border-blue-200 bg-gradient-to-br from-slate-900 to-blue-900 text-2xl font-black tracking-wider text-sky-300 shadow-lg transition duration-300 group-hover:scale-105">
                {product.icon}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col p-5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-sky-600">{product.brand}</p>
            <h2 className="mt-2 line-clamp-2 min-h-12 text-base font-extrabold leading-6 text-slate-800 group-hover:text-blue-700">
              {product.name}
            </h2>
            <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{product.description}</p>
            <p className="mt-auto pt-4 text-xl font-black text-red-600">
              ฿{product.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </Link>
      </article>
    )
  }

  return (
    <article className="group flex min-h-[430px] flex-col bg-white transition hover:shadow-lg">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative grid aspect-square place-items-center overflow-hidden bg-white p-4">
          <span className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-bold ${product.inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-700 text-white'}`}>
            {product.inStock ? 'มีสินค้า' : 'สินค้าหมด'}
          </span>
          <div className="absolute h-36 w-36 rounded-full bg-sky-300/30 blur-2xl" />
          <div className="relative grid h-28 w-36 place-items-center border border-blue-200 bg-gradient-to-br from-slate-900 to-blue-900 text-2xl font-black tracking-wider text-sky-300 shadow-xl transition duration-300 group-hover:scale-105">
            {product.icon}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">{product.brand}</p>
        <Link to={`/products/${product.id}`} className="mt-2 line-clamp-2 min-h-12 text-sm font-bold leading-6 text-slate-800 hover:text-blue-700">
          {product.name}
        </Link>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{product.description}</p>
        <p className="mt-auto pt-5 text-lg font-black text-slate-900">
          ฿{product.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </article>
  )
}

export default ProductCard
