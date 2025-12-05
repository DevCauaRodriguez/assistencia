import { Response } from 'express';
import db from '../config/database';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getCategorias = async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM categorias WHERE ativo = true ORDER BY nome'
    );

    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ message: 'Erro ao buscar categorias' });
  }
};
