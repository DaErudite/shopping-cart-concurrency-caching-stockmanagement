import express from 'express';
import { createOrder } from '../controllers/order.js';
import { requireAuth } from '../middleware/requireAuth.js';




const router = express.Router();

router.post('/checkout', requireAuth, createOrder);

export default router;
