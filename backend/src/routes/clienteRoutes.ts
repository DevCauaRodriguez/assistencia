import { Router } from 'express';
import {
  getClientes,
  getClienteById,
  getClienteByCPFCNPJ,
  createCliente,
  updateCliente,
  deleteCliente
} from '../controllers/clienteController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET
router.get('/', getClientes);
router.get('/by-cpf', getClienteByCPFCNPJ);
router.get('/:id', getClienteById);

// POST
router.post('/', createCliente);

// PUT
router.put('/:id', updateCliente);

// DELETE
router.delete('/:id', deleteCliente);

export default router;
