import express from 'express';
import { upload } from '../config/multer.config.js';
import { uploadAndExtract, getSupplierStats } from '../controllers/invoice.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Optional auth middleware - works for both authenticated and guest users
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      await protect(req, res, () => {});
      next();
    } catch (error) {
      // If auth fails, continue as guest
      next();
    }
  } else {
    // No auth header, continue as guest
    next();
  }
};

// Upload and extract invoice data
router.post('/extract', optionalAuth, upload.single('invoice'), uploadAndExtract);

// Upload invoice (alias for extract)
router.post('/upload', protect, upload.single('invoice'), uploadAndExtract);

// Get supplier statistics
router.get('/supplier/stats', protect, getSupplierStats);

export default router;
