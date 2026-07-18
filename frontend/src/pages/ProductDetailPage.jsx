import { useEffect, useState } from 'react'
import {
  MdAdd,
  MdFavorite,
  MdFavoriteBorder,
  MdOutlineAssignmentTurnedIn,
  MdOutlineLocalShipping,
  MdOutlineShoppingBag,
  MdOutlineTimer,
  MdOutlineVerifiedUser,
  MdRemove,
} from 'react-icons/md'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { useCart } from '../hooks/useCart'
import { useFavorites } from '../hooks/useFavorites'
import { useAuth } from '../hooks/useAuth'
import LoginRequiredToast from '../components/LoginRequiredToast'

const serviceHighlights = [
  { title: 'ส่งฟรีทั่วไทย', detail: 'เมื่อช้อปครบ 5,000 บาทขึ้นไป', icon: MdOutlineLocalShipping },
  { title: 'เปลี่ยนคืนสินค้าง่าย', detail: 'เปลี่ยนสินค้าใหม่ภายใน 7 วัน', icon: MdOutlineAssignmentTurnedIn },
  { title: 'รวดเร็วในการให้บริการ', detail: 'พร้อมให้คำแนะนำอย่างใส่ใจ', icon: MdOutlineTimer },
  { title: 'ชำระเงินปลอดภัย', detail: 'มั่นใจด้วยระบบชำระเงินออนไลน์', icon: MdOutlineVerifiedUser },
]

// Prefers a real value the admin entered in Product.specs (see data/productSpecFields.js);
// falls back to the previous brand/name-derived guess when that spec field is unset.
const pick = (product, key, fallback) => {
  const value = product[key]
  return value !== undefined && value !== null && value !== '' ? value : fallback
}

const getCpuSpecs = (product) => {
  const isIntel = product.brand?.toUpperCase() === 'INTEL'
  const isUltra = product.name.toUpperCase().includes('ULTRA')
  const isRyzen7 = product.name.toUpperCase().includes('RYZEN 7')

  return [
    ['Brand', product.brand?.toUpperCase() || '-'],
    ['Series', pick(product, 'cpuSeries', isIntel ? (isUltra ? 'Intel Core Ultra Processors' : 'Intel Core Processors') : 'AMD Ryzen Processors')],
    ['Processor Number', product.name],
    ['Socket Type', pick(product, 'cpuSocket', isIntel ? (isUltra ? 'LGA 1851' : 'LGA 1700') : 'AM5')],
    ['Cores / Threads', pick(product, 'cpuCoresThreads', isRyzen7 ? '8 Cores / 16 Threads' : isIntel ? '20 Cores / 20 Threads' : '6 Cores / 12 Threads')],
    ['Base Frequency', pick(product, 'cpuBaseFreq', isIntel ? '3.3 GHz' : '3.8 GHz')],
    ['Max Turbo Frequency', pick(product, 'cpuMaxTurboFreq', isIntel ? '5.5 GHz' : '5.4 GHz')],
    ['L2 Cache', pick(product, 'cpuL2Cache', isIntel ? '40 MB' : '8 MB')],
    ['L3 Cache', pick(product, 'cpuL3Cache', isIntel ? '30 MB Smart Cache' : '32 MB')],
    ['Graphics Model', pick(product, 'cpuGraphics', isIntel ? 'Intel Graphics' : 'AMD Radeon Graphics')],
    ['CPU Cooler', pick(product, 'cpuCooler', 'N/A')],
    ['Default TDP', pick(product, 'cpuTdp', isIntel ? '125W' : '65W')],
    ['Maximum Turbo Power', pick(product, 'cpuMaxTurboPower', isIntel ? '250W' : '120W')],
    ['Warranty', pick(product, 'warranty', '3 Years')],
  ]
}

const getMotherboardSpecs = (product) => {
  const chipset = product.chipset || 'B650'
  const isIntel = ['H610', 'B760', 'Z790', 'H810', 'B860', 'Z890'].includes(chipset.toUpperCase())
  const isDdr5 = !product.name.toUpperCase().includes('DDR4') && !['A520', 'H610'].includes(chipset.toUpperCase())
  const socket = isIntel ? (['Z890', 'B860', 'H810'].includes(chipset.toUpperCase()) ? 'LGA 1851' : 'LGA 1700') : (['A520', 'B550'].includes(chipset.toUpperCase()) ? 'AM4' : 'AM5')

  return [
    ['Brands', product.brand?.toUpperCase() || '-'],
    ['CPU Support', isIntel ? 'Intel Core Processors\nIntel Core Ultra Processors' : 'AMD Ryzen 3000 Series\nAMD Ryzen 4000 G-Series\nAMD Ryzen 5000 Series\nAMD Ryzen 7000 / 8000 / 9000 Series'],
    ['CPU Socket', pick(product, 'cpuSocket', socket)],
    ['Chipset', `${isIntel ? 'Intel' : 'AMD'} ${chipset.toUpperCase()}`],
    ['Memory Slots', pick(product, 'memorySlots', '2 x DIMM')],
    ['Memory Type', pick(product, 'memoryTypeSupport', isDdr5 ? 'DDR5' : 'DDR4')],
    ['Max Memory', isDdr5 ? '128GB' : '64GB'],
    ['Onboard Graphics', 'Integrated Graphics on supported Processor'],
    ['Onboard Audio Chipset', 'Realtek 7.1 Channel HD Audio'],
    ['Audio Channels', '7.1 CH HD Audio'],
    ['Expansion Slots', '1 x PCIe x16 Slot\n1 x PCIe x1 Slot'],
    ['Storage', '2 x M.2 Socket\n4 x SATA 6Gb/s port(s)'],
    ['Rear Panel I/O', '1 x HDMI port\n1 x DisplayPort\n1 x LAN port\n4 x USB 2.0 ports\n4 x USB 3.2 ports\n3 x Audio jacks'],
    ['LAN Chipset', 'Realtek 2.5Gb Ethernet'],
    ['LAN Speed', '10/100/1000/2500 Mbps'],
    ['Dimensions', '24.4 cm x 24.4 cm'],
    ['Power Pin', '24+8 Pin'],
    ['Form Factor', pick(product, 'formFactor', 'Micro-ATX')],
    ['Warranty', pick(product, 'warranty', '3 Years')],
  ]
}

const getProductSpecs = (product) => {
  if (product.category === 'cpu') return getCpuSpecs(product)
  if (product.category === 'motherboard') return getMotherboardSpecs(product)

  const common = [['Brands', product.brand?.toUpperCase() || '-'], ['Model', product.name]]
  const gpuMemory = product.name.match(/\d+GB/i)?.[0] || '8GB'
  const gpuMemoryType = /RTX 50|RX 90/i.test(product.name) ? 'GDDR7' : 'GDDR6'
  const isNvidiaGpu = product.gpuSeries?.toUpperCase().includes('NVIDIA')
  const isAmdGpu = product.gpuSeries?.toUpperCase().includes('AMD')
  const isGamingNotebook = /GAMING|RTX/i.test(product.name)
  const isCreatorNotebook = /CREATOR|OLED/i.test(product.name)
  const categorySpecs = {
    gpu: [
      ['GPU Series', product.gpuSeries || 'Graphics Processor Series'],
      ['GPU Model', product.gpuModel || product.name],
      ['Memory Size', pick(product, 'memorySize', `${gpuMemory} ${gpuMemoryType}`)],
      ['Bus Standards', 'PCI Express 4.0 x16'],
      ['OpenGL', 'OpenGL 4.6'],
      [isNvidiaGpu ? 'CUDA® Cores' : isAmdGpu ? 'Stream Processors' : 'Xe Cores', isNvidiaGpu ? '6144' : isAmdGpu ? '4096' : '160'],
      ['Memory Interface', pick(product, 'memoryInterface', `${Number.parseInt(gpuMemory, 10) >= 16 ? '256' : '192'}-bit`)],
      ['Boost Clock', isNvidiaGpu ? '2610 MHz (OC mode)' : isAmdGpu ? '2970 MHz' : '2670 MHz'],
      ['Memory Clock', gpuMemoryType === 'GDDR7' ? '28.0 Gbps' : '18.0 Gbps'],
      ['Max Digital Resolution', '7680 x 4320'],
      ['HDMI Port', '1 x HDMI 2.1'],
      ['Display Port', '3 x DisplayPort 1.4a'],
      ['Power Connector', pick(product, 'powerConnector', Number.parseInt(gpuMemory, 10) >= 16 ? '1 x 16-pin' : '1 x 8-pin')],
      ['Power Requirement', `${Number.parseInt(gpuMemory, 10) >= 24 ? 1000 : Number.parseInt(gpuMemory, 10) >= 16 ? 750 : 650} Watt`],
      ['Dimension', '300 x 120 x 50 mm'],
    ],
    ram: [
      ['Memory Capacity', product.memoryCapacity || '16GB'],
      ['Memory Type', product.memoryType || 'DDR5'],
      ['Speed', pick(product, 'speed', product.name.match(/\d{4}MHz/i)?.[0] || '5600MHz')],
      ['Module', product.memoryCapacity?.includes('x2') ? 'Dual Channel Kit' : 'Single Module'],
      ['Voltage', product.memoryType === 'DDR4' ? '1.35V' : '1.25V'],
    ],
    storage: [
      ['Storage Type', pick(product, 'storageType', product.icon === 'HDD' ? 'Hard Disk Drive' : 'Solid State Drive')],
      ['Capacity', pick(product, 'capacity', product.name.match(/\d+(?:GB|TB)/i)?.[0] || '1TB')],
      ['Interface', pick(product, 'interface', product.name.toUpperCase().includes('NVME') ? 'M.2 PCIe NVMe' : product.icon === 'HDD' ? 'SATA 6Gb/s' : 'SATA III')],
      ['Form Factor', pick(product, 'formFactor', product.name.toUpperCase().includes('M.2') ? 'M.2 2280' : product.icon === 'HDD' ? '3.5 inch' : '2.5 inch')],
    ],
    psu: [
      ['Continuous Power', `${product.continuousPower || 650} Watt`],
      ['Efficiency Rating', pick(product, 'efficiencyRating', product.name.match(/80\+\s*\w+/i)?.[0] || '80 Plus Bronze')],
      ['Modular', pick(product, 'modular', '-')],
      ['Power Standard', 'ATX'],
      ['Input Voltage', '100-240V AC'],
      ['Cooling Fan', '120mm Fan'],
    ],
    cooling: [
      ['Cooling Type', pick(product, 'coolingType', product.icon === 'AIO' ? 'Liquid Cooling' : 'Air Cooling')],
      ['Radiator / Fan Size', pick(product, 'radiatorFanSize', product.name.match(/\d+mm/i)?.[0] || '120mm')],
      ['Lighting', pick(product, 'lighting', 'ARGB')],
      ['Socket Support', 'Intel LGA / AMD AM4, AM5'],
    ],
    notebook: [
      ['Processors', pick(product, 'processor', isGamingNotebook ? 'Intel® Core™ i7 High Performance Processor' : isCreatorNotebook ? 'Intel® Core™ Ultra 7 Processor' : 'Intel® Core™ i5 Processor')],
      ['Processor Speed', isGamingNotebook ? 'Up to 5.0GHz, 24MB Intel Smart Cache' : 'Up to 4.6GHz, 12MB Intel Smart Cache'],
      ['Video Graphics', pick(product, 'graphics', isGamingNotebook ? 'NVIDIA® GeForce RTX™ Graphics' : isCreatorNotebook ? 'Intel® Arc™ Graphics' : 'Intel® UHD Graphics (Integrated Graphics)')],
      ['Screen Size', product.notebookScreenSize || '15.6"'],
      ['Display', isCreatorNotebook ? 'OLED 2.8K, 100% DCI-P3 color gamut' : isGamingNotebook ? 'FHD IPS, 144Hz, Anti-glare' : 'FHD IPS, Anti-glare display'],
      ['Memory', `${product.notebookMemory || '16GB'} DDR5 SO-DIMM`],
      ['Storage', product.notebookStorage || '512GB PCIe® NVMe™ M.2 SSD'],
      ['Operating System', 'Windows 11 Home'],
      ['Camera', 'FHD Webcam with privacy shutter'],
      ['Connection port', '1 x HDMI port\n2 x USB 3.2 Type-A ports\n1 x USB Type-C port\n1 x Audio combo jack\n1 x microSD card reader'],
      ['Wi-Fi / Bluetooth', 'Wi-Fi 6E, 802.11ax 2x2 + Bluetooth 5.3'],
      ['Battery', isGamingNotebook ? '4-Cell Li-ion Battery, 70WHrs' : '3-Cell Li-ion Battery, 53WHrs'],
      ['Color', product.brand === 'ACER' ? 'STEEL GRAY' : 'MIDNIGHT BLACK'],
      ['Dimensions', product.notebookScreenSize === '14"' ? '312.4 x 220.1 x 16.9 mm' : '357.6 x 235.7 x 18.5 mm'],
      ['Weight', product.notebookScreenSize === '14"' ? '1.4 kg' : isGamingNotebook ? '2.2 kg' : '1.8 kg'],
    ],
    monitor: [
      ['Display Size (in.)', product.monitorDisplaySize || '27"'],
      ['Panel Size (in.)', product.monitorDisplaySize || '27"'],
      ['Panel Type', pick(product, 'panelType', 'IPS')],
      ['Resolution', product.monitorResolution || '1920 x 1080'],
      ['Resolution Type', product.monitorResolution === '3840 x 2160' ? '4K UHD' : product.monitorResolution === '2560 x 1440' ? 'QHD' : 'Full HD'],
      ['Display Viewing Area (H x V)', product.monitorDisplaySize === '32"' ? '708.5 x 398.5 mm' : product.monitorDisplaySize === '24"' ? '527.0 x 296.5 mm' : '596.7 x 335.7 mm'],
      ['Refresh Rate', product.monitorRefreshRate || '165Hz'],
      ['Response Time', '1ms (GtG)'],
      ['Display Color', '1.07 Billion'],
      ['Brightness', '400 cd/m²'],
      ['Contrast Ratio', '1000 : 1'],
      ['Aspect Ratio', '16 : 9'],
      ['Screen Curvature', 'Flat Screen'],
      ['Pixel Pitch (H x V)', '0.2331 x 0.2331 mm'],
      ['Viewing Angle (CR≥10)', '178° (H) / 178° (V)'],
      ['Color Gamut', 'Adobe RGB : 94%\nDCI-P3 : 97%\nsRGB : 124%'],
      ['HDR Support', product.monitorResolution === '3840 x 2160' ? 'DisplayHDR 400' : 'HDR Ready'],
      ['Adaptive Sync', 'Adaptive-Sync'],
      ['Display Surface', 'Anti-Glare'],
      ['Flicker Free', 'Yes'],
      ['Low Blue Light', 'Yes'],
      ['Connectivity', '2 x HDMI 2.0b\n1 x DisplayPort 1.4a\n1 x USB Type-C\n2 x USB-A 5.0Gbps\n1 x Headphone Jack'],
      ['Signal Frequency', '30-255 KHz (H) / 48-240 Hz (V)'],
      ['Built-in Speaker', '2 x 3 Watt Speakers'],
      ['Power Consumption', 'Power Type : Internal Power Board\nPower Input : 100-240V 50/60Hz'],
      ['Mechanical', 'Kensington Lock : Yes\nVESA Mounting : 100 x 100 mm\nTilt Adjustment : -5° to +20°\nHeight Adjustment : 0-100mm'],
      ['Dimension (W x H x D)', '613.5 x 462.3 x 63.8 mm'],
      ['Weight (Esti.)', 'Net Weight 6.55 kg'],
      ['Accessory in Box', '1 x HDMI Cable\n1 x DisplayPort Cable\n1 x Power Cord\n1 x Quick Start Guide\n4 x VESA Wall Mount Screw'],
    ],
    keyboard: [
      ['Keyboard Type', pick(product, 'keyboardType', 'Gaming Keyboard')],
      ['Switch Type', pick(product, 'switchType', 'Mechanical')],
      ['Interface', pick(product, 'interface', 'USB')],
      ['Lighting', pick(product, 'lighting', 'RGB')],
    ],
    mouse: [
      ['Mouse Type', pick(product, 'mouseType', 'Gaming Mouse')],
      ['Connection', pick(product, 'connection', product.name.toUpperCase().includes('WIRELESS') ? 'Wireless' : 'USB')],
      ['Sensor', pick(product, 'sensor', 'Optical Sensor')],
      ['DPI', pick(product, 'dpi', 'Up to 12,000 DPI')],
    ],
    accessory: [
      ['Product Type', pick(product, 'productType', 'Computer Accessory')],
      ['Interface', pick(product, 'interface', 'USB Type-C')],
      ['Color', pick(product, 'color', 'Black')],
    ],
    case: [
      ['Case Type', pick(product, 'caseType', 'Mid Tower')],
      ['Mainboard Support', pick(product, 'mainboardSupport', 'ATX / Micro-ATX / Mini-ITX')],
      ['Front I/O', pick(product, 'frontIO', 'USB 3.0 / USB 2.0 / Audio')],
      ['Cooling Support', '120mm / 140mm Fan'],
    ],
    headset: [
      ['Headset Type', pick(product, 'headsetType', 'Gaming Headset')],
      ['Connection', pick(product, 'connection', '3.5mm / USB')],
      ['Microphone', pick(product, 'microphone', 'Built-in Microphone')],
      ['Sound', pick(product, 'sound', 'Stereo / Virtual Surround')],
    ],
  }

  return [...common, ...(categorySpecs[product.category] || [['Category', product.categoryName]]), ['Warranty', pick(product, 'warranty', '3 Years')]]
}

function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const [showLoginMessage, setShowLoginMessage] = useState(false)
  const { isFavorite, toggleFavorite } = useFavorites()
  const [quantity, setQuantity] = useState(1)
  const { products, loading } = useProducts()
  const product = products.find((item) => item.id === Number(id))

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [id])

  if (loading && !product) return <div className="grid min-h-[60vh] place-items-center text-center"><p className="text-lg font-bold text-slate-500">กำลังโหลดข้อมูลสินค้า...</p></div>
  if (!product) return <div className="grid min-h-[60vh] place-items-center text-center"><div><h1 className="text-3xl font-black">ไม่พบสินค้า</h1><Link to="/" className="mt-5 inline-block text-blue-700">กลับหน้า Home</Link></div></div>

  const specs = getProductSpecs(product)
  const favorite = isFavorite(product.id)
  const addToCartAndOpen = () => {
    if (!isAuthenticated) {
      setShowLoginMessage(true)
      return
    }
    if (!product.inStock) return
    addItem(product, quantity)
    navigate('/cart')
  }
  const handleFavorite = () => {
    if (!isAuthenticated) {
      setShowLoginMessage(true)
      return
    }
    toggleFavorite(product.id)
    if (!favorite) navigate('/favorites')
  }

  return (
    <div>
      {showLoginMessage && <LoginRequiredToast onClose={() => setShowLoginMessage(false)} />}
      <section className="product-detail-layout">
        <div className="min-w-0">
          <div className="flex min-h-[560px] w-full items-center justify-center overflow-hidden rounded-2xl bg-white p-10 shadow-sm">
            {product.image_url ? <img src={product.image_url} alt={product.name} className="max-h-[480px] max-w-full object-contain" /> : <div className="grid h-[420px] w-[420px] max-w-full place-items-center rounded-xl bg-gradient-to-br from-slate-950 to-blue-900 text-6xl font-black tracking-wider text-sky-300 shadow-2xl">{product.icon}</div>}
          </div>
          <div className="mx-auto mt-5 grid h-20 w-20 place-items-center rounded-lg border-2 border-blue-600 bg-white text-sm font-black text-blue-800">{product.icon}</div>
        </div>

        <div className="min-w-0 px-1 py-1">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${product.inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-700 text-white'}`}>{product.inStock ? 'มีสินค้า' : 'สินค้าหมด'}</span>
          <div className="mt-4 flex items-start justify-between gap-4"><h1 className="text-xl font-black leading-8 text-slate-900">{product.name}</h1><button type="button" onClick={handleFavorite} className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 ${favorite ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}>{favorite ? <MdFavorite className="h-5 w-5" /> : <MdFavoriteBorder className="h-5 w-5" />}</button></div>
          <p className="mt-3 text-sm text-slate-500">แบรนด์: <strong className="text-slate-700">{product.brand?.toUpperCase() || '-'}</strong><span className="mx-3">|</span>รหัสสินค้า: SKU-{String(product.id).padStart(8, '0')}</p>
          <div className="mt-5 border-t border-slate-300 pt-5"><p className="text-2xl font-black text-slate-900">฿{product.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p></div>

          <div className="mt-6 flex items-center gap-3"><span className="mr-2 text-sm font-bold">จำนวน</span><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid h-10 w-10 place-items-center rounded border border-blue-700 text-blue-700"><MdRemove /></button><span className="min-w-8 text-center font-bold">{String(quantity).padStart(2, '0')}</span><button type="button" onClick={() => setQuantity((value) => value + 1)} className="grid h-10 w-10 place-items-center rounded border border-blue-700 text-blue-700"><MdAdd /></button></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2"><button type="button" onClick={addToCartAndOpen} disabled={!product.inStock} className="flex items-center justify-center gap-2 rounded-lg border-2 border-blue-700 px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-transparent"><MdOutlineShoppingBag className="h-5 w-5" />เพิ่มในตะกร้า</button><button type="button" onClick={addToCartAndOpen} disabled={!product.inStock} className="rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300">{product.inStock ? 'ซื้อเลย' : 'สินค้าหมด'}</button></div>
        </div>
      </section>

      <section className="product-specs mt-12">
        <h2 className="flex items-center gap-2 text-xl font-black text-slate-900"><span className="h-6 w-1.5 rounded-full bg-blue-700" />รายละเอียดสินค้า</h2>
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="product-spec-table w-full border-collapse text-left text-sm"><tbody>{specs.map(([label, value]) => <tr key={label}><th className="w-[35%] bg-slate-50 px-5 py-3.5 align-top font-bold text-slate-700">{label}</th><td className="whitespace-pre-line px-5 py-3.5 leading-6 text-slate-600">{value}</td></tr>)}</tbody></table>
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="จุดเด่นบริการ PrimePC">
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

export default ProductDetailPage
