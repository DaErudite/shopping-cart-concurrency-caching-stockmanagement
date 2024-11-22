import express from 'express';
import { addProduct, getAllProducts, getProduct } from '../controllers/product.js';


// import Author from './author.js';

const router = express.Router();

router.post('/', addProduct);
router.get('/', getAllProducts);
router.get('/:id', getProduct);




export default router;
