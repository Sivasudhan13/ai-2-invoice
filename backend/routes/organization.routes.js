import express from 'express';
import { protect, requireRole, requirePermission } from '../middleware/auth.js';
import {
  createOrganization,
  createSupplier,
  createMentor,
  getOrganizationUsers,
  updateUserStatus,
  updateUser,
  deleteUser,
  getAnalytics,
  getOrganizationInvoices,
  deleteInvoice
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
router.put('/user/:userId', requireRole('organization_admin'), updateUser);
router.delete('/user/:userId', requireRole('organization_admin'), deleteUser);
router.get('/analytics', requireRole('organization_admin'), getAnalytics);
router.delete('/invoice/:invoiceId', requireRole('organization_admin'), deleteInvoice);

// Routes requiring organization membership (admin, supplier, or mentor)
router.get('/invoices', getOrganizationInvoices);

// Mount alert routes at /api/organization/alerts
router.use('/alerts', alertRoutes);

export default router;
