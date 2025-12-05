import { Router } from 'express';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, toggleUsuarioStatus } from '../controllers/usuarioController';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', getUsuarios);
router.post('/', createUsuario);
router.put('/:id', updateUsuario);
router.patch('/:id/toggle-status', toggleUsuarioStatus);
router.delete('/:id', deleteUsuario);

export default router;
