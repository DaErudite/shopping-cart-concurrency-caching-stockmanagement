import express from 'express';
import { getUser, loginUser, registerUser } from '../controllers/user.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { addToCart, deleteFromCart, getCart } from '../controllers/cart.js';



const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/full-profile',requireAuth, getUser);
router.get('/cart', requireAuth, getCart);
router.put('/cart', requireAuth, addToCart);
router.put('/cart/remove', requireAuth, deleteFromCart); 



export default router;
