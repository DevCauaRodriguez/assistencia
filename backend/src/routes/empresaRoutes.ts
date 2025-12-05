import { Router } from 'express';
import { getEmpresas, createEmpresa, updateEmpresa, deleteEmpresa } from '../controllers/empresaController';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getEmpresas);
router.post('/', createEmpresa);
router.put('/:id', updateEmpresa);
router.delete('/:id', adminMiddleware, deleteEmpresa);

export default router;
