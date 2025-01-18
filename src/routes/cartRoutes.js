// cartRoutes.js
import express from 'express';
import { createCart, getCart, finalizarCompra, getAllCarts, } from '../controller/cartController.js';

const router = express.Router();

router.get('/ventas', getAllCarts); // Cambiamos la ruta de allcart a /ventas
router.post('/', createCart);
router.get('/:id', getCart);
router.post('/finalizar-compra', finalizarCompra);

export default router;