import { useState } from 'react'
import { MdClose, MdSave, MdUpload, MdPhotoLibrary, MdImage } from 'react-icons/md'
import { uploadProductImage, listProductImages } from '../services/uploadService'
import { getSpecFieldsForCategory } from '../data/productSpecFields'

const PRODUCT_CATEGORIES = [
  'cpu', 'motherboard', 'gpu', 'ram', 'storage', 'psu',
  'cooling', 'notebook', 'monitor', 'keyboard', 'mouse',
  'accessory', 'case', 'headset',
]

const CATEGORY_TH = {
  cpu: 'ซีพียู', motherboard: 'เมนบอร์ด', gpu: 'การ์ดจอ', ram: 'แรม',
  storage: 'อุปกรณ์จัดเก็บข้อมูล', psu: 'พาวเวอร์ซัพพลาย', cooling: 'ระบายความร้อน',
  notebook: 'โน้ตบุ๊ก', monitor: 'จอมอนิเตอร์', keyboard: 'คีย์บอร์ด',
  mouse: 'เมาส์', accessory: 'อุปกรณ์เสริม', case: 'เคส', headset: 'หูฟัง',
}

const EMPTY_PRODUCT = {
  name: '', brand: '', category: 'cpu', price: '', stock: '',
  description: '', imageUrl: '', isAvailable: true, specs: {},
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

function ProductModal({ initial, onSave, onClose, busy }) {
  const [form, setForm] = useState({
    ...EMPTY_PRODUCT,
    ...initial,
    specs: initial?.specs && typeof initial.specs === 'object' ? initial.specs : {},
  })
  const isEdit = Boolean(initial?.id)

  // Image upload / gallery picker state
  const [uploading, setUploading] = useState(false)
  const [imageError, setImageError] = useState('')
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [galleryImages, setGalleryImages] = useState([])
  const [showUrlInput, setShowUrlInput] = useState(false)

  const update = (field, value) => setForm((c) => ({ ...c, [field]: value }))
  const updateSpec = (key, value) => setForm((c) => ({ ...c, specs: { ...c.specs, [key]: value } }))

  // Category changes must invalidate the gallery cache so it never shows
  // images from a different category's folder.
  const handleCategoryChange = (value) => {
    update('category', value)
    setGalleryOpen(false)
    setGalleryImages([])
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setImageError('')

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError('รองรับเฉพาะไฟล์ JPG, PNG, WEBP หรือ GIF เท่านั้น')
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('ขนาดไฟล์ต้องไม่เกิน 5MB')
      return
    }

    setUploading(true)
    try {
      const { url } = await uploadProductImage(file, form.category)
      update('imageUrl', url)
    } catch (err) {
      setImageError(err.response?.data?.message || 'อัปโหลดรูปไม่สำเร็จ')
    } finally {
      setUploading(false)
    }
  }

  const toggleGallery = async () => {
    const willOpen = !galleryOpen
    setGalleryOpen(willOpen)
    if (!willOpen || galleryImages.length > 0) return

    setGalleryLoading(true)
    setImageError('')
    try {
      const images = await listProductImages(form.category)
      setGalleryImages(images)
    } catch (err) {
      setImageError(err.response?.data?.message || 'โหลดคลังรูปไม่สำเร็จ')
    } finally {
      setGalleryLoading(false)
    }
  }

  const pickGalleryImage = (img) => {
    update('imageUrl', img.url)
    setGalleryOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-black text-slate-900">
            {isEdit ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <MdClose className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">ชื่อสินค้า *</span>
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
              placeholder="เช่น Intel Core i9-14900K"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">แบรนด์ *</span>
            <input
              value={form.brand}
              onChange={(e) => update('brand', e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
              placeholder="เช่น Intel, ASUS"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">หมวดหมู่</span>
            <select
              value={form.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_TH[c] ?? c}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">ราคา (บาท) *</span>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
              placeholder="0"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">สต็อก (ชิ้น)</span>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => update('stock', e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
              placeholder="0"
            />
          </label>

          <div className="block sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">ข้อมูลจำเพาะ</span>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              {getSpecFieldsForCategory(form.category).map((field) => (
                <label key={field.key} className="block">
                  <span className="text-sm font-semibold text-slate-700">{field.label}</span>
                  <input
                    value={form.specs?.[field.key] ?? ''}
                    onChange={(e) => updateSpec(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="block sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">รูปภาพสินค้า</span>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt={form.name || 'product'} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <MdImage className="h-8 w-8" />
                    <span className="text-xs">ยังไม่มีรูปภาพ</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <label
                    className={`flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 ${
                      uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    }`}
                  >
                    <MdUpload className="h-4 w-4" />
                    {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปใหม่'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={toggleGallery}
                    disabled={uploading}
                    className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MdPhotoLibrary className="h-4 w-4" />เลือกจากคลังรูป
                  </button>
                </div>

                {imageError && <p className="text-xs font-semibold text-red-600">{imageError}</p>}

                {galleryOpen && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    {galleryLoading ? (
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="aspect-square animate-pulse rounded-lg bg-slate-200" />
                        ))}
                      </div>
                    ) : galleryImages.length === 0 ? (
                      <p className="py-4 text-center text-xs text-slate-400">ยังไม่มีรูปในหมวดนี้</p>
                    ) : (
                      <div className="grid max-h-48 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6">
                        {galleryImages.map((img) => (
                          <button
                            key={img.path}
                            type="button"
                            onClick={() => pickGalleryImage(img)}
                            className="aspect-square overflow-hidden rounded-lg border border-slate-200 hover:ring-2 hover:ring-sky-500"
                          >
                            <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput((v) => !v)}
                    className="text-xs font-semibold text-sky-600 hover:underline"
                  >
                    {showUrlInput ? 'ซ่อน URL รูปภาพ' : 'วาง URL รูปภาพเอง'}
                  </button>
                  {showUrlInput && (
                    <input
                      value={form.imageUrl}
                      onChange={(e) => update('imageUrl', e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
                      placeholder="https://..."
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">คำอธิบาย</span>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
              placeholder="รายละเอียดสินค้า"
            />
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) => update('isAvailable', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-blue-600"
            />
            <span className="text-sm font-semibold text-slate-700">แสดงสินค้า (เปิดขาย)</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
            ยกเลิก
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={busy || uploading || !form.name || !form.brand || !form.price}
            className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            <MdSave className="h-4 w-4" />
            {busy ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductModal
