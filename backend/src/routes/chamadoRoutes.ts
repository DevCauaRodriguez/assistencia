import { Router } from 'express';
import { 
  createChamado, 
  getChamados, 
  getChamadoById, 
  updateChamado, 
  updateStatus,
  atribuirTecnico,
  addComentario,
  getComentarios,
  getHistorico
} from '../controllers/chamadoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createChamado);
router.get('/', getChamados);
router.get('/:id', getChamadoById);
router.put('/:id', updateChamado);
router.patch('/:id/status', updateStatus);
router.patch('/:id/atribuir', atribuirTecnico);
router.post('/:id/comentarios', addComentario);
router.get('/:id/comentarios', getComentarios);
router.get('/:id/historico', getHistorico);

export default router;
