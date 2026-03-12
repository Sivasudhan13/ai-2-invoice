import express from 'express';
import { protect, requireRole, requirePermission } from '../middleware/auth.js';
import {
  createOrganization,
  createSupplier,
  createMentor,
  getOrganizationUsers,
  updateUserStatus,
  getAnalytics,
  getOrganizationInvoices
} from '../controllers/organization.controller.js';
import alertRoutes from './alert.routes.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Organization creation (may need different role requirements)
router.post('/create', createOrganization);

// Organization admin only routes
router.post('/supplier', requireRole('organization_admin'), createSupplier);
router.post('/mentor', requireRole('organization_admin'), createMentor);
router.get('/users', requireRole('organization_admin'), getOrganizationUsers);
router.put('/user/status', requireRole('organization_admin'), updateUserStatus);
router.get('/analytics', requireRole('organization_admin'), getAnalytics);

// Routes requiring organization membership (admin, supplier, or mentor)
router.get('/invoices', getOrganizationInvoices);

// Mount alert routes at /api/organization/alerts
router.use('/alerts', alertRoutes);

export default router;
