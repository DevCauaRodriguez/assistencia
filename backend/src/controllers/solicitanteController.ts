import { Response } from 'express';
import db from '../config/database';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getSolicitantes = async (req: AuthRequest, res: Response) => {
  try {
    const [solicitantes] = await db.query(
      'SELECT id, nome, cpf_cnpj, telefone, cooperativa, ativo FROM solicitantes WHERE ativo = true ORDER BY nome ASC'
    );
    res.json(solicitantes);
  } catch (error) {
    console.error('Erro ao buscar solicitantes:', error);
    res.status(500).json({ error: 'Erro ao buscar solicitantes' });
  }
};

export const getSolicitanteById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [solicitante]: any = await db.query(
      'SELECT id, nome, cpf_cnpj, telefone, cooperativa, ativo FROM solicitantes WHERE id = ?',
      [id]
    );
    
    if (!solicitante || solicitante.length === 0) {
      return res.status(404).json({ error: 'Solicitante não encontrado' });
    }
    
    res.json(solicitante[0]);
  } catch (error) {
    console.error('Erro ao buscar solicitante:', error);
    res.status(500).json({ error: 'Erro ao buscar solicitante' });
  }
};

export const getSolicitanteByCPFCNPJ = async (req: AuthRequest, res: Response) => {
  try {
    const { cpf_cnpj } = req.query;
    
    if (!cpf_cnpj) {
      return res.status(400).json({ error: 'CPF/CNPJ é obrigatório' });
    }
    
    const [solicitante]: any = await db.query(
      'SELECT id, nome, cpf_cnpj, telefone, cooperativa, ativo FROM solicitantes WHERE cpf_cnpj = ?',
      [cpf_cnpj]
    );
    
    if (!solicitante || solicitante.length === 0) {
      return res.status(404).json({ error: 'Solicitante não encontrado' });
    }
    
    res.json(solicitante[0]);
  } catch (error) {
    console.error('Erro ao buscar solicitante:', error);
    res.status(500).json({ error: 'Erro ao buscar solicitante' });
  }
};

export const createSolicitante = async (req: AuthRequest, res: Response) => {
  try {
    const { nome, cpf_cnpj, telefone, cooperativa } = req.body;
    
    if (!nome || !cpf_cnpj || !telefone) {
      return res.status(400).json({ error: 'Nome, CPF/CNPJ e Telefone são obrigatórios' });
    }
    
    // Verificar se solicitante já existe
    const [existing]: any = await db.query(
      'SELECT id FROM solicitantes WHERE cpf_cnpj = ?',
      [cpf_cnpj]
    );
    
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Solicitante com este CPF/CNPJ já existe' });
    }
    
    const [result]: any = await db.query(
      'INSERT INTO solicitantes (nome, cpf_cnpj, telefone, cooperativa, ativo, created_at) VALUES (?, ?, ?, ?, true, NOW())',
      [nome, cpf_cnpj, telefone, cooperativa || null]
    );
    
    res.status(201).json({
      id: result.insertId,
      nome,
      cpf_cnpj,
      telefone,
      cooperativa,
      ativo: true
    });
  } catch (error) {
    console.error('Erro ao criar solicitante:', error);
    res.status(500).json({ error: 'Erro ao criar solicitante' });
  }
};

export const updateSolicitante = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, cpf_cnpj, telefone, cooperativa, ativo } = req.body;
    
    // Verificar se solicitante existe
    const [existing]: any = await db.query(
      'SELECT id FROM solicitantes WHERE id = ?',
      [id]
    );
    
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Solicitante não encontrado' });
    }
    
    // Se CPF/CNPJ está sendo alterado, verificar duplicata
    if (cpf_cnpj) {
      const [duplicate]: any = await db.query(
        'SELECT id FROM solicitantes WHERE cpf_cnpj = ? AND id != ?',
        [cpf_cnpj, id]
      );
      
      if (duplicate && duplicate.length > 0) {
        return res.status(400).json({ error: 'CPF/CNPJ já está em uso' });
      }
    }
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (nome) {
      updates.push('nome = ?');
      values.push(nome);
    }
    if (cpf_cnpj) {
      updates.push('cpf_cnpj = ?');
      values.push(cpf_cnpj);
    }
    if (telefone) {
      updates.push('telefone = ?');
      values.push(telefone);
    }
    if (cooperativa !== undefined) {
      updates.push('cooperativa = ?');
      values.push(cooperativa || null);
    }
    if (ativo !== undefined) {
      updates.push('ativo = ?');
      values.push(ativo);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    values.push(id);
    
    await db.query(
      `UPDATE solicitantes SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({ message: 'Solicitante atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar solicitante:', error);
    res.status(500).json({ error: 'Erro ao atualizar solicitante' });
  }
};

export const deleteSolicitante = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Soft delete - apenas desativa
    await db.query(
      'UPDATE solicitantes SET ativo = false WHERE id = ?',
      [id]
    );
    
    res.json({ message: 'Solicitante desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar solicitante:', error);
    res.status(500).json({ error: 'Erro ao desativar solicitante' });
  }
};
