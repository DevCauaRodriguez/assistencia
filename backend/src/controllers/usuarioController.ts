import { Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/database';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getUsuarios = async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nome, email, perfil, especializacao, ativo FROM usuarios ORDER BY nome'
    );

    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
};

export const createUsuario = async (req: AuthRequest, res: Response) => {
  try {
    const { nome, email, senha, perfil, especializacao } = req.body;

    const hashedPassword = await bcrypt.hash(senha, 10);

    const [result]: any = await db.query(
      'INSERT INTO usuarios (nome, email, senha, perfil, especializacao) VALUES (?, ?, ?, ?, ?)',
      [nome, email, hashedPassword, perfil, especializacao]
    );

    res.status(201).json({ 
      message: 'Usuário criado com sucesso',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
};

export const updateUsuario = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, email, perfil, especializacao, ativo } = req.body;

    await db.query(
      'UPDATE usuarios SET nome = ?, email = ?, perfil = ?, especializacao = ?, ativo = ? WHERE id = ?',
      [nome, email, perfil, especializacao, ativo, id]
    );

    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
};

export const deleteUsuario = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await db.query('UPDATE usuarios SET ativo = false WHERE id = ?', [id]);

    res.json({ message: 'Usuário inativado com sucesso' });
  } catch (error) {
    console.error('Erro ao inativar usuário:', error);
    res.status(500).json({ message: 'Erro ao inativar usuário' });
  }
};

export const toggleUsuarioStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Busca o status atual do usuário
    const [rows]: any = await db.query('SELECT ativo FROM usuarios WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const novoStatus = !rows[0].ativo;

    await db.query('UPDATE usuarios SET ativo = ? WHERE id = ?', [novoStatus, id]);

    res.json({ 
      message: novoStatus ? 'Usuário ativado com sucesso' : 'Usuário inativado com sucesso',
      ativo: novoStatus
    });
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    res.status(500).json({ message: 'Erro ao alterar status do usuário' });
  }
};
