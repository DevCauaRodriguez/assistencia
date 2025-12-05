import { Router } from 'express';
import { getCategorias } from '../controllers/categoriaController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getCategorias);

export default router;
