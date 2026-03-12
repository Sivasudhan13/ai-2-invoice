import express from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import {
  getAlerts,
  markAlertAsReviewed
} from '../controllers/alert.controller.js';

const router = express.Router();

// All routes require authentication and organization_admin role
router.use(protect);
router.use(requireRole('organization_admin'));

// GET /api/organization/alerts - List all alerts for organization
router.get('/', getAlerts);

// PATCH /api/organization/alerts/:id - Mark alert as reviewed
router.patch('/:id', markAlertAsReviewed);

export default router;
