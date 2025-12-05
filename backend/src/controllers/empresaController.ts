import { Response } from 'express';
import db from '../config/database';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getEmpresas = async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM empresas ORDER BY nome'
    );

    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    res.status(500).json({ message: 'Erro ao buscar empresas' });
  }
};

export const createEmpresa = async (req: AuthRequest, res: Response) => {
  try {
    const { nome, cnpj, telefone, email, prestador_id } = req.body;

    const [result]: any = await db.query(
      'INSERT INTO empresas (nome, cnpj, telefone, email, prestador_id) VALUES (?, ?, ?, ?, ?)',
      [nome, cnpj, telefone, email || null, prestador_id || null]
    );

    res.status(201).json({ 
      message: 'Empresa criada com sucesso',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    res.status(500).json({ message: 'Erro ao criar empresa' });
  }
};

export const updateEmpresa = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, cnpj, telefone, email, prestador_id, ativo } = req.body;

    await db.query(
      'UPDATE empresas SET nome = ?, cnpj = ?, telefone = ?, email = ?, prestador_id = ?, ativo = ? WHERE id = ?',
      [nome, cnpj, telefone, email || null, prestador_id || null, ativo, id]
    );

    res.json({ message: 'Empresa atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    res.status(500).json({ message: 'Erro ao atualizar empresa' });
  }
};

export const deleteEmpresa = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await db.query('UPDATE empresas SET ativo = false WHERE id = ?', [id]);

    res.json({ message: 'Empresa inativada com sucesso' });
  } catch (error) {
    console.error('Erro ao inativar empresa:', error);
    res.status(500).json({ message: 'Erro ao inativar empresa' });
  }
};
