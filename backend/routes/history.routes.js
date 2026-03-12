import express from 'express';
import { getHistory, deleteHistory } from '../controllers/history.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getHistory);
router.delete('/:id', deleteHistory);

export default router;
