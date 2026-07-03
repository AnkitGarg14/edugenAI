const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middlewares/auth.middleware');
const {
  upload,
  getAll,
  getRecent,
  getById,
  deleteDoc,
  rename
} = require('../controllers/document.controller');

// Use memory storage for buffer piping to Cloudinary
const storage = multer.memoryStorage();
const uploadMiddleware = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// All document routes are protected
router.use(protect);

router.post('/upload', uploadMiddleware.single('file'), upload);
router.get('/', getAll);
router.get('/recent', getRecent);
router.get('/:id', getById);
router.put('/:id/rename', rename);
router.delete('/:id', deleteDoc);

module.exports = router;
