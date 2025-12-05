import { Response } from 'express';
import db from '../config/database';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getAllPrestadores = async (req: AuthRequest, res: Response) => {
  try {
    const [prestadores] = await db.query(`
      SELECT 
        id, nome, cnpj, telefone, email, ativo, 
        created_at, updated_at
      FROM prestadores
      ORDER BY nome
    `);

    res.json(prestadores);
  } catch (error) {
    console.error('Erro ao buscar prestadores:', error);
    res.status(500).json({ message: 'Erro ao buscar prestadores' });
  }
};

export const createPrestador = async (req: AuthRequest, res: Response) => {
  try {
    const { nome, cnpj, telefone, email } = req.body;

    if (!nome || !cnpj) {
      return res.status(400).json({ message: 'Nome e CNPJ são obrigatórios' });
    }

    // Verificar se CNPJ já existe
    const [existing]: any = await db.query(
      'SELECT id FROM prestadores WHERE cnpj = ?',
      [cnpj]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'CNPJ já cadastrado' });
    }

    const [result]: any = await db.query(
      `INSERT INTO prestadores (nome, cnpj, telefone, email) 
       VALUES (?, ?, ?, ?)`,
      [nome, cnpj, telefone || null, email || null]
    );

    res.status(201).json({
      id: result.insertId,
      nome,
      cnpj,
      telefone,
      email,
      ativo: true
    });
  } catch (error) {
    console.error('Erro ao criar prestador:', error);
    res.status(500).json({ message: 'Erro ao criar prestador' });
  }
};

export const updatePrestador = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, cnpj, telefone, email, ativo } = req.body;

    if (!nome || !cnpj) {
      return res.status(400).json({ message: 'Nome e CNPJ são obrigatórios' });
    }

    // Verificar se prestador existe
    const [existing]: any = await db.query(
      'SELECT id FROM prestadores WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Prestador não encontrado' });
    }

    // Verificar se CNPJ já existe em outro prestador
    const [cnpjCheck]: any = await db.query(
      'SELECT id FROM prestadores WHERE cnpj = ? AND id != ?',
      [cnpj, id]
    );

    if (cnpjCheck.length > 0) {
      return res.status(400).json({ message: 'CNPJ já cadastrado para outro prestador' });
    }

    await db.query(
      `UPDATE prestadores 
       SET nome = ?, cnpj = ?, telefone = ?, email = ?, ativo = ?
       WHERE id = ?`,
      [nome, cnpj, telefone || null, email || null, ativo !== undefined ? ativo : true, id]
    );

    res.json({ message: 'Prestador atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar prestador:', error);
    res.status(500).json({ message: 'Erro ao atualizar prestador' });
  }
};
