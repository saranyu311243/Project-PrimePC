const { v4: uuidv4 } = require('uuid');
const { supabase, BUCKET, isConfigured } = require('../lib/supabaseStorage');
const { PRODUCT_CATEGORIES } = require('../lib/categories');

// Extension is derived from the verified mimetype below, never from the
// client-supplied filename, so it can't be used to smuggle a different type.
const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};
const ALLOWED_MIME = Object.keys(MIME_TO_EXT);
const SAFE_FILENAME = /^[a-zA-Z0-9._-]+$/;

// Magic-byte signatures — the declared mimetype/Content-Type is attacker-controlled,
// so it's not enough on its own; the actual bytes must match a real image format.
const isValidImageBuffer = (buffer, mimetype) => {
  if (mimetype === 'image/webp') {
    return (
      buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP'
    );
  }
  const signatures = {
    'image/jpeg': [0xff, 0xd8, 0xff],
    'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    'image/gif': [0x47, 0x49, 0x46, 0x38],
  };
  const sig = signatures[mimetype];
  return Boolean(sig) && sig.every((byte, i) => buffer[i] === byte);
};

const publicUrlFor = (filePath) => supabase.storage.from(BUCKET).getPublicUrl(filePath).data.publicUrl;

// Upload a product image into <category>/ inside the bucket (Staff/Admin only)
const uploadImage = async (req, res) => {
  try {
    if (!isConfigured) {
      return res.status(503).json({ success: false, message: 'Image storage is not configured' });
    }

    const { category } = req.body;
    if (!PRODUCT_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    if (!ALLOWED_MIME.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Unsupported image type (allowed: jpeg, png, webp, gif)' });
    }

    if (!isValidImageBuffer(req.file.buffer, req.file.mimetype)) {
      return res.status(400).json({ success: false, message: 'File content does not match a valid image format' });
    }

    const filename = `${Date.now()}-${uuidv4()}${MIME_TO_EXT[req.file.mimetype]}`;
    const filePath = `${category}/${filename}`;

    const { error } = await supabase.storage.from(BUCKET).upload(filePath, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });
    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: { path: filePath, url: publicUrlFor(filePath) },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message }),
    });
  }
};

// List images already uploaded under a category folder, newest first (Staff/Admin only)
const listImages = async (req, res) => {
  try {
    if (!isConfigured) {
      return res.status(503).json({ success: false, message: 'Image storage is not configured' });
    }

    const { category } = req.query;
    if (!PRODUCT_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    const { data, error } = await supabase.storage.from(BUCKET).list(category, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    });
    if (error) throw error;

    // Supabase returns a placeholder entry for empty folders (no `id`) — skip it.
    const images = (data || [])
      .filter((f) => f.id)
      .map((f) => {
        const filePath = `${category}/${f.name}`;
        return { name: f.name, path: filePath, url: publicUrlFor(filePath) };
      });

    res.json({ success: true, data: images });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to list images',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message }),
    });
  }
};

// Delete an image from the bucket (Staff/Admin only)
const deleteImage = async (req, res) => {
  try {
    if (!isConfigured) {
      return res.status(503).json({ success: false, message: 'Image storage is not configured' });
    }

    const { path: filePath } = req.body;
    if (typeof filePath !== 'string') {
      return res.status(400).json({ success: false, message: 'path is required' });
    }

    const parts = filePath.split('/');
    const [category, filename] = parts;
    const validPath =
      parts.length === 2 &&
      PRODUCT_CATEGORIES.includes(category) &&
      filename && filename !== '.' && filename !== '..' &&
      SAFE_FILENAME.test(filename);

    if (!validPath) {
      return res.status(400).json({ success: false, message: 'Invalid path' });
    }

    const { error } = await supabase.storage.from(BUCKET).remove([`${category}/${filename}`]);
    if (error) throw error;

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message }),
    });
  }
};

module.exports = { uploadImage, listImages, deleteImage };
