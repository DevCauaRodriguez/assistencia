import { Router } from 'express';
import {
  getSolicitantes,
  getSolicitanteById,
  getSolicitanteByCPFCNPJ,
  createSolicitante,
  updateSolicitante,
  deleteSolicitante
} from '../controllers/solicitanteController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET
router.get('/', getSolicitantes);
router.get('/by-cpf', getSolicitanteByCPFCNPJ);
router.get('/:id', getSolicitanteById);

// POST
router.post('/', createSolicitante);

// PUT
router.put('/:id', updateSolicitante);

// DELETE
router.delete('/:id', deleteSolicitante);

export default router;
