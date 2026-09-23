const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.png';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'snapshot-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// POST /api/upload - Multipart file upload
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/upload/base64 - Save canvas snapshot base64 image
router.post('/base64', (req, res) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'No base64 image data provided' });
    }

    // Clean base64 header (e.g. data:image/png;base64,...)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const fname = (filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '') : 'snapshot') + '-' + Date.now() + '.png';
    const filePath = path.join(UPLOADS_DIR, fname);

    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${fname}`;
    return res.json({
      success: true,
      message: 'Base64 snapshot saved successfully',
      url: fileUrl,
      filename: fname
    });
  } catch (error) {
    console.error('Error saving base64 image:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
