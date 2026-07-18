// Canonical per-category "specs" field definitions.
//
// This is the single source of truth for the product `specs` JSON blob, used by BOTH
// the admin/staff product edit form (components/ProductModal.jsx) and the product
// detail page (pages/ProductDetailPage.jsx) — so the fields an admin can edit and the
// fields the storefront displays never drift out of sync. Key names here become the
// keys stored in Product.specs (and, via normalizeProduct, spread onto the top-level
// product object as product.<key>).
export const PRODUCT_SPEC_FIELDS = {
  cpu: [
    { key: 'cpuSeries', label: 'Series', placeholder: 'เช่น Intel Core Ultra Processors' },
    { key: 'cpuSocket', label: 'Socket Type', placeholder: 'เช่น LGA 1851, AM5' },
    { key: 'cpuCoresThreads', label: 'Cores / Threads', placeholder: 'เช่น 8 Cores / 16 Threads' },
    { key: 'cpuBaseFreq', label: 'Base Frequency', placeholder: 'เช่น 3.3 GHz' },
    { key: 'cpuMaxTurboFreq', label: 'Max Turbo Frequency', placeholder: 'เช่น 5.5 GHz' },
    { key: 'cpuL2Cache', label: 'L2 Cache', placeholder: 'เช่น 40 MB' },
    { key: 'cpuL3Cache', label: 'L3 Cache', placeholder: 'เช่น 30 MB Smart Cache' },
    { key: 'cpuGraphics', label: 'Graphics Model', placeholder: 'เช่น Intel Graphics' },
    { key: 'cpuCooler', label: 'CPU Cooler', placeholder: 'เช่น N/A หรือชุดระบายความร้อนที่แถม' },
    { key: 'cpuTdp', label: 'Default TDP', placeholder: 'เช่น 125W' },
    { key: 'cpuMaxTurboPower', label: 'Maximum Turbo Power', placeholder: 'เช่น 250W' },
  ],
  motherboard: [
    { key: 'chipset', label: 'Chipset', placeholder: 'เช่น B650' },
    { key: 'cpuSocket', label: 'CPU Socket', placeholder: 'เช่น AM5, LGA 1700' },
    { key: 'memoryTypeSupport', label: 'Memory Type', placeholder: 'เช่น DDR5' },
    { key: 'memorySlots', label: 'Memory Slots', placeholder: 'เช่น 2 x DIMM' },
    { key: 'formFactor', label: 'Form Factor', placeholder: 'เช่น Micro-ATX' },
  ],
  gpu: [
    { key: 'gpuSeries', label: 'GPU Series', placeholder: 'เช่น NVIDIA GeForce RTX 50 Series' },
    { key: 'gpuModel', label: 'GPU Model', placeholder: 'เช่น GeForce RTX 5070' },
    { key: 'memorySize', label: 'Memory Size', placeholder: 'เช่น 12GB GDDR7' },
    { key: 'memoryInterface', label: 'Memory Interface', placeholder: 'เช่น 192-bit' },
    { key: 'powerConnector', label: 'Power Connector', placeholder: 'เช่น 1 x 16-pin' },
  ],
  ram: [
    { key: 'memoryCapacity', label: 'Memory Capacity', placeholder: 'เช่น 32GB (16GBx2)' },
    { key: 'memoryType', label: 'Memory Type', placeholder: 'เช่น DDR5' },
    { key: 'speed', label: 'Speed', placeholder: 'เช่น 6000MHz' },
  ],
  storage: [
    { key: 'storageType', label: 'Storage Type', placeholder: 'เช่น Solid State Drive, Hard Disk Drive' },
    { key: 'capacity', label: 'Capacity', placeholder: 'เช่น 1TB' },
    { key: 'interface', label: 'Interface', placeholder: 'เช่น M.2 PCIe NVMe Gen4' },
    { key: 'formFactor', label: 'Form Factor', placeholder: 'เช่น M.2 2280' },
  ],
  psu: [
    { key: 'continuousPower', label: 'Continuous Power (Watt)', placeholder: 'เช่น 850' },
    { key: 'efficiencyRating', label: 'Efficiency Rating', placeholder: 'เช่น 80 Plus Gold' },
    { key: 'modular', label: 'Modular', placeholder: 'เช่น Fully Modular' },
  ],
  cooling: [
    { key: 'coolingType', label: 'Cooling Type', placeholder: 'เช่น Liquid Cooling, Air Cooling' },
    { key: 'radiatorFanSize', label: 'Radiator / Fan Size', placeholder: 'เช่น 360mm' },
    { key: 'lighting', label: 'Lighting', placeholder: 'เช่น ARGB' },
  ],
  notebook: [
    { key: 'processor', label: 'Processor', placeholder: 'เช่น Intel Core Ultra 7 Processor' },
    { key: 'graphics', label: 'Graphics', placeholder: 'เช่น NVIDIA GeForce RTX Graphics' },
    { key: 'notebookScreenSize', label: 'Screen Size', placeholder: 'เช่น 15.6"' },
    { key: 'notebookMemory', label: 'Memory', placeholder: 'เช่น 16GB' },
    { key: 'notebookStorage', label: 'Storage', placeholder: 'เช่น 1TB PCIe 4.0 NVMe M.2 SSD' },
  ],
  monitor: [
    { key: 'monitorDisplaySize', label: 'Display Size', placeholder: 'เช่น 27"' },
    { key: 'monitorResolution', label: 'Resolution', placeholder: 'เช่น 2560 x 1440' },
    { key: 'monitorRefreshRate', label: 'Refresh Rate', placeholder: 'เช่น 165Hz' },
    { key: 'panelType', label: 'Panel Type', placeholder: 'เช่น IPS' },
  ],
  keyboard: [
    { key: 'keyboardType', label: 'Keyboard Type', placeholder: 'เช่น Gaming Keyboard' },
    { key: 'switchType', label: 'Switch Type', placeholder: 'เช่น Mechanical' },
    { key: 'interface', label: 'Interface', placeholder: 'เช่น USB, Wireless' },
    { key: 'lighting', label: 'Lighting', placeholder: 'เช่น RGB' },
  ],
  mouse: [
    { key: 'mouseType', label: 'Mouse Type', placeholder: 'เช่น Gaming Mouse' },
    { key: 'connection', label: 'Connection', placeholder: 'เช่น Wireless, USB' },
    { key: 'sensor', label: 'Sensor', placeholder: 'เช่น Optical Sensor' },
    { key: 'dpi', label: 'DPI', placeholder: 'เช่น Up to 12,000 DPI' },
  ],
  accessory: [
    { key: 'productType', label: 'Product Type', placeholder: 'เช่น Computer Accessory' },
    { key: 'interface', label: 'Interface', placeholder: 'เช่น USB Type-C' },
    { key: 'color', label: 'Color', placeholder: 'เช่น Black' },
  ],
  case: [
    { key: 'caseType', label: 'Case Type', placeholder: 'เช่น Mid Tower' },
    { key: 'mainboardSupport', label: 'Mainboard Support', placeholder: 'เช่น ATX / Micro-ATX / Mini-ITX' },
    { key: 'frontIO', label: 'Front I/O', placeholder: 'เช่น USB 3.0 / USB 2.0 / Audio' },
  ],
  headset: [
    { key: 'headsetType', label: 'Headset Type', placeholder: 'เช่น Gaming Headset' },
    { key: 'connection', label: 'Connection', placeholder: 'เช่น 3.5mm, USB' },
    { key: 'microphone', label: 'Microphone', placeholder: 'เช่น Built-in Microphone' },
    { key: 'sound', label: 'Sound', placeholder: 'เช่น Stereo, Virtual Surround' },
  ],
}

// Appended to every category in both the edit form and the detail page.
export const WARRANTY_FIELD = { key: 'warranty', label: 'Warranty', placeholder: 'เช่น 3 Years' }

/** Ordered list of { key, label, placeholder } spec fields for a given product category. */
export const getSpecFieldsForCategory = (category) => [
  ...(PRODUCT_SPEC_FIELDS[category] || []),
  WARRANTY_FIELD,
]
