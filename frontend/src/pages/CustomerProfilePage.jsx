import { useState } from 'react'
import { MdAdd, MdArrowBack, MdDeleteOutline, MdEdit, MdFavoriteBorder, MdLocationOn, MdLogout, MdPersonOutline, MdSave } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'
import { useAuth } from '../hooks/useAuth'
import { useFavorites } from '../hooks/useFavorites'
import { useCart } from '../hooks/useCart'

const readStorage = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

const emptyAddress = { fullName: '', phone: '', address: '', postalCode: '', province: '', district: '', subdistrict: '' }

function CustomerProfilePage() {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuth()
  const { favoriteIds } = useFavorites()
  const { clearCart } = useCart()
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState(() => readStorage('primepc-profile', { firstName: '', lastName: '', email: user?.email || '', phone: '', birthDate: '' }))
  const [address, setAddress] = useState(() => readStorage('primepc-address', emptyAddress))
  const [savedAddress, setSavedAddress] = useState(() => readStorage('primepc-address', null))
  const [addressView, setAddressView] = useState('list')
  const [editingAddress, setEditingAddress] = useState(false)
  const [message, setMessage] = useState('')
  const favoriteProducts = products.filter((product) => favoriteIds.includes(product.id))

  const updateProfile = (field, value) => setProfile((current) => ({ ...current, [field]: value }))
  const updateAddress = (field, value) => setAddress((current) => ({ ...current, [field]: value }))
  const saveProfile = (event) => {
    event.preventDefault()
    localStorage.setItem('primepc-profile', JSON.stringify(profile))
    updateUser(profile)
    setMessage('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว')
  }
  const saveAddress = (event) => {
    event.preventDefault()
    if (Object.values(address).some((value) => !String(value).trim())) {
      setMessage('กรุณากรอกข้อมูลที่อยู่ให้ครบทุกช่อง')
      return
    }
    localStorage.setItem('primepc-address', JSON.stringify(address))
    setSavedAddress(address)
    setMessage('บันทึกที่อยู่จัดส่งเรียบร้อยแล้ว')
    setAddressView('list')
  }
  const editAddress = () => {
    setAddress(savedAddress || emptyAddress)
    setEditingAddress(true)
    setMessage('')
    setAddressView('form')
  }
  const deleteAddress = () => {
    localStorage.removeItem('primepc-address')
    setSavedAddress(null)
    setAddress(emptyAddress)
    setMessage('ลบที่อยู่เรียบร้อยแล้ว')
  }
  const handleLogout = () => {
    clearCart()
    logout()
    navigate('/')
  }

  const menuButton = (id, label, Icon) => (
    <button type="button" onClick={() => { setActiveTab(id); setMessage(''); if (id === 'address') setAddressView('list') }} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition ${activeTab === id ? 'bg-blue-700 text-white shadow-md' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}><Icon className="h-5 w-5" />{label}</button>
  )

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="border-b border-slate-200 px-3 pb-4"><div className="grid h-14 w-14 place-items-center rounded-full bg-blue-100 text-xl font-black text-blue-700">{(user?.firstName || user?.email || 'P').charAt(0).toUpperCase()}</div><p className="mt-3 truncate font-black text-slate-900">{user?.firstName || user?.email?.split('@')[0] || 'PrimePC Member'}</p><p className="truncate text-xs text-slate-500">{user?.email}</p></div>
        <nav className="mt-4 space-y-1">
          {menuButton('profile', 'ข้อมูลส่วนตัว', MdPersonOutline)}
          {menuButton('address', 'ที่อยู่สำหรับจัดส่ง', MdLocationOn)}
          {menuButton('favorites', 'สินค้าที่ชื่นชอบ', MdFavoriteBorder)}
        </nav>
        <button type="button" onClick={handleLogout} className="mt-8 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 transition duration-200 hover:bg-red-50"><MdLogout className="h-5 w-5" />ออกจากระบบ</button>
      </aside>

      <main className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        {activeTab === 'profile' && <section><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">MY PRIMEPC</p><h1 className="mt-1 text-3xl font-black">ข้อมูลส่วนตัว</h1><p className="mt-2 text-sm text-slate-500">แก้ไขข้อมูลบัญชีและวันเดือนปีเกิดของคุณ</p></div><form onSubmit={saveProfile} className="mt-8 grid gap-5 sm:grid-cols-2">
          <label><span className="text-sm font-bold">ชื่อ</span><input value={profile.firstName} onChange={(event) => updateProfile('firstName', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-blue-600" /></label>
          <label><span className="text-sm font-bold">นามสกุล</span><input value={profile.lastName} onChange={(event) => updateProfile('lastName', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-blue-600" /></label>
          <label><span className="text-sm font-bold">อีเมล</span><input type="email" value={profile.email} onChange={(event) => updateProfile('email', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-blue-600" /></label>
          <label><span className="text-sm font-bold">เบอร์โทรศัพท์</span><input value={profile.phone} onChange={(event) => updateProfile('phone', event.target.value.replace(/\D/g, '').slice(0, 10))} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-blue-600" /></label>
          <label className="sm:col-span-2"><span className="text-sm font-bold">วันเดือนปีเกิด</span><input type="date" value={profile.birthDate} onChange={(event) => updateProfile('birthDate', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-blue-600" /></label>
          {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 sm:col-span-2">{message}</p>}
          <button className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3.5 font-black text-white hover:bg-blue-800 sm:col-span-2"><MdSave />บันทึกข้อมูล</button>
        </form></section>}

        {activeTab === 'address' && <section>
          {addressView === 'list' ? <>
            <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">SHIPPING ADDRESS</p><h1 className="mt-1 text-3xl font-black">ที่อยู่สำหรับจัดส่ง</h1><p className="mt-2 text-sm text-slate-500">ดูรายละเอียด แก้ไข หรือลบที่อยู่ที่บันทึกไว้</p></div><button type="button" onClick={() => { setAddress(emptyAddress); setEditingAddress(false); setMessage(''); setAddressView('form') }} className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"><MdAdd />เพิ่มที่อยู่</button></div>
            {message && <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
            {savedAddress ? <article className="mt-7 rounded-2xl border-2 border-blue-200 bg-blue-50 p-6"><div className="flex items-start justify-between gap-5"><div className="flex items-start gap-3"><MdLocationOn className="mt-1 h-6 w-6 shrink-0 text-blue-700" /><div><p className="font-black text-slate-900">{savedAddress.fullName}</p><p className="mt-1 text-sm text-slate-500">{savedAddress.phone}</p><p className="mt-3 text-sm leading-6 text-slate-600">{savedAddress.address}<br />{savedAddress.subdistrict} {savedAddress.district}<br />{savedAddress.province} {savedAddress.postalCode}</p></div></div><div className="flex gap-2"><button type="button" onClick={editAddress} className="grid h-10 w-10 place-items-center rounded-lg border border-blue-300 text-blue-700 hover:bg-white" aria-label="แก้ไขที่อยู่"><MdEdit /></button><button type="button" onClick={deleteAddress} className="grid h-10 w-10 place-items-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50" aria-label="ลบที่อยู่"><MdDeleteOutline /></button></div></div></article> : <div className="mt-8 rounded-2xl bg-slate-50 p-12 text-center"><MdLocationOn className="mx-auto h-14 w-14 text-slate-300" /><p className="mt-4 font-black">ยังไม่มีที่อยู่สำหรับจัดส่ง</p><p className="mt-2 text-sm text-slate-500">กด “เพิ่มที่อยู่” เพื่อบันทึกที่อยู่สำหรับรับสินค้า</p></div>}
          </> : <>
            <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">ADDRESS FORM</p><h1 className="mt-1 text-3xl font-black">{editingAddress ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'}</h1></div><button type="button" onClick={() => { setMessage(''); setAddressView('list') }} className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"><MdArrowBack />กลับหน้ารายการ</button></div>
          <form onSubmit={saveAddress} className="mt-7 grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="text-sm font-bold">ชื่อ - นามสกุล</span><input value={address.fullName} onChange={(event) => updateAddress('fullName', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-blue-600" /></label>
            <label className="sm:col-span-2"><span className="text-sm font-bold">เบอร์โทรศัพท์</span><input value={address.phone} onChange={(event) => updateAddress('phone', event.target.value.replace(/\D/g, '').slice(0, 10))} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-blue-600" /></label>
            <label className="sm:col-span-2"><span className="text-sm font-bold">ที่อยู่</span><input value={address.address} onChange={(event) => updateAddress('address', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-blue-600" /></label>
            <label><span className="text-sm font-bold">รหัสไปรษณีย์</span><input value={address.postalCode} onChange={(event) => updateAddress('postalCode', event.target.value.replace(/\D/g, '').slice(0, 5))} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-blue-600" /></label>
            <label><span className="text-sm font-bold">จังหวัด</span><input value={address.province} onChange={(event) => updateAddress('province', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-blue-600" /></label>
            <label><span className="text-sm font-bold">อำเภอ / เขต</span><input value={address.district} onChange={(event) => updateAddress('district', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-blue-600" /></label>
            <label><span className="text-sm font-bold">ตำบล / แขวง</span><input value={address.subdistrict} onChange={(event) => updateAddress('subdistrict', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none focus:border-blue-600" /></label>
            {message && <p className={`rounded-xl px-4 py-3 text-sm sm:col-span-2 ${message.includes('เรียบร้อย') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{message}</p>}
            <button className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3.5 font-black text-white hover:bg-blue-800 sm:col-span-2"><MdSave />บันทึกที่อยู่</button>
          </form>
          </>}
        </section>}

        {activeTab === 'favorites' && <section><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-600">MY FAVORITES</p><h1 className="mt-1 text-3xl font-black">สินค้าที่ชื่นชอบ</h1></div>{favoriteProducts.length ? <div className="mt-8 grid gap-5 xl:grid-cols-2">{favoriteProducts.map((product) => <ProductCard key={product.id} product={product} variant="listing" />)}</div> : <div className="mt-8 rounded-2xl bg-slate-50 p-12 text-center"><MdFavoriteBorder className="mx-auto h-14 w-14 text-slate-300" /><p className="mt-4 font-black">ยังไม่มีสินค้าที่ชื่นชอบ</p></div>}</section>}
      </main>
    </div>
  )
}

export default CustomerProfilePage
