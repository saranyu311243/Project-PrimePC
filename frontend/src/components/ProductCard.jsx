import { Link } from 'react-router-dom'

function ProductCard({ product }) {
  return (
    <article className="group flex min-h-[430px] flex-col bg-white transition hover:shadow-lg">
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative grid aspect-square place-items-center overflow-hidden bg-white p-4">
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
