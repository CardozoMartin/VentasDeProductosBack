// ventasRoutes.js
import express from 'express';
import { 
    finalizarCompra, 
    getVentasReporte,
    // ... otros controladores
} from '../controller/ventaControllers.js';

const router = express.Router();

router.post('/finalizar-compra', finalizarCompra);
router.get('/reporte', getVentasReporte);
// ... otras rutas

export default router;