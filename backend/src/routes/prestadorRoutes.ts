import { Router } from 'express';
import { getAllPrestadores, createPrestador, updatePrestador } from '../controllers/prestadorController';

const router = Router();

router.get('/', getAllPrestadores);
router.post('/', createPrestador);
router.put('/:id', updatePrestador);

export default router;
