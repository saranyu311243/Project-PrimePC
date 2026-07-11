import {
  MdDeveloperBoard,
  MdOutlineAcUnit,
  MdOutlineComputer,
  MdOutlineHeadphones,
  MdOutlineKeyboard,
  MdOutlineLaptop,
  MdOutlineMemory,
  MdOutlineMonitor,
  MdOutlineMouse,
  MdOutlinePower,
  MdOutlineSportsEsports,
  MdOutlineStorage,
  MdOutlineVideogameAsset,
} from 'react-icons/md'
import { FaMicrochip } from 'react-icons/fa6'

const icons = {
  cpu: FaMicrochip,
  motherboard: MdDeveloperBoard,
  gpu: MdOutlineVideogameAsset,
  ram: MdOutlineMemory,
  storage: MdOutlineStorage,
  psu: MdOutlinePower,
  cooling: MdOutlineAcUnit,
  notebook: MdOutlineLaptop,
  monitor: MdOutlineMonitor,
  keyboard: MdOutlineKeyboard,
  mouse: MdOutlineMouse,
  accessory: MdOutlineSportsEsports,
  case: MdOutlineComputer,
  headset: MdOutlineHeadphones,
}

function CategoryIcon({ name, className = 'h-6 w-6' }) {
  const Icon = icons[name] ?? FaMicrochip
  return <Icon className={className} aria-hidden="true" />
}

export default CategoryIcon
