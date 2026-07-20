const firstMatch = (text, pattern) => text.match(pattern)?.[1]

const inferGpuSeries = (text) => {
  if (/geforce\s+rtx\s+5\d{3}/i.test(text)) return 'NVIDIA GeForce RTX 50 Series'
  if (/geforce\s+rtx\s+4\d{3}/i.test(text)) return 'NVIDIA GeForce RTX 40 Series'
  if (/radeon\s+rx\s*9\d{3}/i.test(text)) return 'AMD Radeon RX 9000 Series'
  if (/radeon\s+rx\s*7\d{3}/i.test(text)) return 'AMD Radeon RX 7000 Series'
  if (/intel\s+arc\s+a\d{3}/i.test(text)) return 'Intel Arc A Series'
  if (/intel\s+arc\s+b\d{3}/i.test(text)) return 'Intel Arc B Series'
  return undefined
}

const inferChipset = (text) => firstMatch(
  text,
  /\b(H610|B550|A520|X670|Z790|B760|B650|X870|Z890|B860|B850|H810|A620A|B840)(?:M)?\b/i,
)

const inferStorageType = (text, icon) => {
  if (String(icon).toUpperCase() === 'HDD' || /\bHDD\b|hard\s*disk|ฮาร์ดดิสก์/i.test(text)) return 'Hard Disk Drive'
  if (String(icon).toUpperCase() === 'SSD' || /\bSSD\b|NVMe/i.test(text)) return 'Solid State Drive'
  return undefined
}

const inferMemoryCapacity = (text) => {
  const totalFirst = text.match(/\b(8GB|16GB|32GB|64GB|96GB)\s*\(\s*(\d+)\s*x\s*(8GB|16GB|32GB|48GB)\s*\)/i)
  if (totalFirst) return `${totalFirst[1].toUpperCase()} (${totalFirst[2]}x${totalFirst[3].toUpperCase()})`

  const moduleFirst = text.match(/\b(8GB|16GB|32GB|48GB)\s*x\s*(\d+)\b/i)
  if (moduleFirst) {
    const moduleSize = Number(moduleFirst[1].replace(/GB/i, ''))
    const count = Number(moduleFirst[2])
    return `${moduleSize * count}GB (${moduleSize}GBx${count})`
  }

  const total = firstMatch(text, /\b(8GB|16GB|32GB|64GB|96GB)\b/i)?.toUpperCase()
  if (total === '8GB') return '8GB (8GBx1)'
  if (total === '16GB') return '16GB (16GBx1)'
  if (total === '32GB') return '32GB (32GBx1)'
  if (total === '64GB') return '64GB (64GBx1)'
  return undefined
}

const inferCoolingType = (text, icon) => {
  if (String(icon).toUpperCase() === 'AIO' || /\bAIO\b|liquid|water\s*cool|coreliquid|ชุดน้ำ|หม้อน้ำ/i.test(text)) return 'Liquid Cooling'
  if (/air\s*cool|heat\s*sink|ฮี[ตท]ซิงก์|ซิงก์ลม|พัดลมซีพียู|hyper\s*212|peerless\s*assassin|dark\s*rock|NH-D15|AK620/i.test(text)) return 'Air Cooling'
  if (String(icon).toUpperCase() === 'FAN' || /case\s*fan|พัดลมเคส/i.test(text)) return 'Case Fan'
  if (/liquid\s*freezer|kraken|H150i/i.test(text)) return 'Liquid Cooling'
  if (text.trim()) return 'Air Cooling'
  return undefined
}

const inferScreenSize = (text) => {
  const size = firstMatch(text, /\b(13(?:\.3|\.4|\.6)?|14|15(?:\.3|\.6)?|16|17\.3|22|23\.8|24(?:\.5)?|25|27|32|34)\s*(?:นิ้ว|inch|")/i)
  return size ? `${size}"` : undefined
}

const inferResolution = (text) => {
  const resolution = firstMatch(text, /\b(1280\s*x\s*720|1920\s*x\s*1080|2560\s*x\s*1440|2560\s*x\s*1600|3440\s*x\s*1440|3840\s*x\s*2160|5120\s*x\s*2880)\b/i)
  if (resolution) return resolution.replace(/\s*x\s*/i, ' x ')
  if (/\b4K\b/i.test(text)) return '3840 x 2160'
  if (/Full\s*HD/i.test(text)) return '1920 x 1080'
  return undefined
}

/**
 * Fill filter fields from visible catalog data when an older product has no
 * structured specs. Explicit specs from the API always win over these values.
 */
export const inferProductFilterFields = (product = {}) => {
  const text = [product.name, product.description].filter(Boolean).join(' ')
  const capacity = firstMatch(text, /\b(256GB|512GB|1TB|2TB|4TB)\b/i)
  const memory = firstMatch(text, /\b(8GB|16GB|24GB|32GB|64GB|96GB)\b/i)
  const refreshRate = firstMatch(text, /\b(60|100|120|144|165|180|240|280|300|360|480|540)\s*Hz\b/i)
  const power = firstMatch(text, /\b(550|600|650|750|850|1000|1050|1200|1250|1300|3000)\s*(?:W(?:att)?|วัตต์)(?=\s|\.|,|$)/i)

  const shared = {
    chipset: inferChipset(text),
    gpuSeries: inferGpuSeries(text),
    continuousPower: power ? Number(power) : undefined,
  }

  if (product.category === 'ram') {
    return {
      ...shared,
      memoryCapacity: inferMemoryCapacity(text),
      memoryType: firstMatch(text, /\b(DDR4|DDR5)\b/i)?.toUpperCase(),
    }
  }

  if (product.category === 'storage') {
    return {
      ...shared,
      storageType: inferStorageType(text, product.icon),
      capacity: capacity?.toUpperCase(),
    }
  }

  if (product.category === 'cooling') {
    return {
      ...shared,
      coolingType: inferCoolingType(text, product.icon),
    }
  }

  if (product.category === 'notebook') {
    const screenSize = inferScreenSize(text)
    return {
      ...shared,
      notebookMemory: memory?.toUpperCase(),
      notebookScreenSize: screenSize,
    }
  }

  if (product.category === 'monitor') {
    const screenSize = inferScreenSize(text)
    return {
      ...shared,
      monitorDisplaySize: screenSize,
      monitorResolution: inferResolution(text),
      monitorRefreshRate: refreshRate ? `${refreshRate}Hz` : undefined,
    }
  }

  return shared
}

export const matchesProductFilter = (product, definition, option) => {
  const explicitValue = product[definition.field]
  const inferredValue = inferProductFilterFields(product)[definition.field]
  const normalizeMemory = (value) => {
    const compact = String(value ?? '').replace(/\s+/g, '')
    const countFirst = compact.match(/^(\d+)GB\((\d+)x(\d+)GB\)$/i)
    if (countFirst) return `${countFirst[1]}:${countFirst[2]}:${countFirst[3]}`
    const moduleFirst = compact.match(/^(\d+)GB\((\d+)GBx(\d+)\)$/i)
    if (moduleFirst) return `${moduleFirst[1]}:${moduleFirst[3]}:${moduleFirst[2]}`
    return compact.toLowerCase()
  }
  const normalize = (value) => {
    if (definition.field === 'memoryCapacity') return normalizeMemory(value)
    if (definition.field === 'storageType') {
      const compact = String(value ?? '').trim().toLowerCase().replace(/\s+/g, '')
      if (compact === 'ssd' || compact === 'solidstatedrive') return 'ssd'
      if (compact === 'hdd' || compact === 'harddiskdrive') return 'hdd'
      return compact
    }
    if (definition.field === 'continuousPower') {
      return firstMatch(String(value), /(550|600|650|750|850|1000|1050|1200|1250|1300|3000)/) ?? ''
    }
    if (definition.field === 'coolingType') {
      const compact = String(value ?? '').trim().toLowerCase().replace(/\s+/g, '')
      if (compact.includes('liquidcool') || compact.includes('watercool') || compact.includes('aio')) return 'liquid'
      if (compact.includes('aircool') || compact.includes('heatsink')) return 'air'
      if (compact.includes('casefan') || compact === 'fan') return 'fan'
      return compact
    }
    if (definition.field === 'notebookMemory') {
      const memory = firstMatch(String(value), /\b(8|16|24|32|64|96)\s*GB\b/i)
      return memory ? `${memory}gb` : ''
    }
    if (definition.field === 'notebookScreenSize') {
      return firstMatch(String(value), /\b(13(?:\.3|\.4|\.6)?|14|15(?:\.3|\.6)?|16|17\.3)\s*(?:นิ้ว|inch|")/i) ?? ''
    }
    return String(value ?? '').trim().toLowerCase().replace(/\s+/g, '')
  }
  const normalizedOption = normalize(option)

  const matchesMonitorValue = (value) => {
    const text = String(value ?? '')
    if (definition.field === 'monitorDisplaySize') {
      const valueSize = firstMatch(text, /\b(15|16|22|23\.8|24(?:\.5)?|25|27|32|34)\s*(?:นิ้ว|inch|")/i)
      const optionSize = firstMatch(String(option), /\b(15|16|22|23\.8|24(?:\.5)?|25|27|32|34)/i)
      return Boolean(valueSize && optionSize && valueSize === optionSize)
    }
    if (definition.field === 'monitorResolution') {
      const resolution = inferResolution(text)
      return Boolean(resolution && normalize(resolution) === normalizedOption)
    }
    if (definition.field === 'monitorRefreshRate') {
      const optionRate = firstMatch(String(option), /(\d+)\s*Hz/i)
      const valueRates = [...text.matchAll(/(\d+)\s*Hz/gi)].map((match) => match[1])
      return Boolean(optionRate && valueRates.includes(optionRate))
    }
    return null
  }

  return [explicitValue, inferredValue]
    .filter((value) => value !== undefined && value !== null && String(value).trim() !== '')
    .some((value) => {
      const monitorMatch = matchesMonitorValue(value)
      if (monitorMatch !== null) return monitorMatch
      return definition.match === 'includes'
        ? normalize(value).includes(normalizedOption)
        : normalize(value) === normalizedOption
    })
}
