// Product category ids — mirrors frontend/src/pages/StaffDashboard.jsx PRODUCT_CATEGORIES
// and prisma/seed.js categoryNames. Also used to whitelist Supabase Storage folder names.
const PRODUCT_CATEGORIES = [
  'cpu', 'motherboard', 'gpu', 'ram', 'storage', 'psu',
  'cooling', 'notebook', 'monitor', 'keyboard', 'mouse',
  'accessory', 'case', 'headset',
];

module.exports = { PRODUCT_CATEGORIES };
