const { createClient } = require('@supabase/supabase-js');

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';
const isConfigured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabase = isConfigured
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

// Creates the product image bucket if it doesn't exist yet. Safe to call on every boot.
async function ensureBucket() {
  if (!supabase) return;

  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw error;

  const options = {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  };

  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET, options);
    if (createError) throw createError;
  } else {
    // Bucket already existed (e.g. created before allowedMimeTypes/fileSizeLimit
    // were added here) — bring it up to the current policy on every boot.
    const { error: updateError } = await supabase.storage.updateBucket(BUCKET, options);
    if (updateError) throw updateError;
  }
}

module.exports = { supabase, BUCKET, isConfigured, ensureBucket };
