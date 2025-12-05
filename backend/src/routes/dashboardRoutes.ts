import { Router } from 'express';
import { getDashboardMetrics, getChamadosAtrasados } from '../controllers/dashboardController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/metrics', getDashboardMetrics);
router.get('/chamados-atrasados', getChamadosAtrasados);

export default router;
