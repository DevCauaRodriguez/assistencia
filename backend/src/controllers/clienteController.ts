import { Response } from 'express';
import db from '../config/database';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getClientes = async (req: AuthRequest, res: Response) => {
  try {
    const [clientes] = await db.query(
      'SELECT id, nome, cpf_cnpj, telefone, cooperativa, ativo FROM clientes WHERE ativo = true ORDER BY nome ASC'
    );
    res.json(clientes);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
};

export const getClienteById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [cliente]: any = await db.query(
      'SELECT id, nome, cpf_cnpj, telefone, cooperativa, ativo FROM clientes WHERE id = ?',
      [id]
    );
    
    if (!cliente || cliente.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json(cliente[0]);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
};

export const getClienteByCPFCNPJ = async (req: AuthRequest, res: Response) => {
  try {
    const { cpf_cnpj } = req.query;
    
    if (!cpf_cnpj) {
      return res.status(400).json({ error: 'CPF/CNPJ é obrigatório' });
    }
    
    const [cliente]: any = await db.query(
      'SELECT id, nome, cpf_cnpj, telefone, cooperativa, ativo FROM clientes WHERE cpf_cnpj = ?',
      [cpf_cnpj]
    );
    
    if (!cliente || cliente.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json(cliente[0]);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
};

export const createCliente = async (req: AuthRequest, res: Response) => {
  try {
    const { nome, cpf_cnpj, telefone, cooperativa } = req.body;
    
    if (!nome || !cpf_cnpj || !telefone) {
      return res.status(400).json({ error: 'Nome, CPF/CNPJ e Telefone são obrigatórios' });
    }
    
    // Verificar se cliente já existe
    const [existing]: any = await db.query(
      'SELECT id FROM clientes WHERE cpf_cnpj = ?',
      [cpf_cnpj]
    );
    
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Cliente com este CPF/CNPJ já existe' });
    }
    
    const [result]: any = await db.query(
      'INSERT INTO clientes (nome, cpf_cnpj, telefone, cooperativa, ativo, created_at) VALUES (?, ?, ?, ?, true, NOW())',
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
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
};

export const updateCliente = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, cpf_cnpj, telefone, cooperativa, ativo } = req.body;
    
    // Verificar se cliente existe
    const [existing]: any = await db.query(
      'SELECT id FROM clientes WHERE id = ?',
      [id]
    );
    
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    // Se CPF/CNPJ está sendo alterado, verificar duplicata
    if (cpf_cnpj) {
      const [duplicate]: any = await db.query(
        'SELECT id FROM clientes WHERE cpf_cnpj = ? AND id != ?',
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
      `UPDATE clientes SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({ message: 'Cliente atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
};

export const deleteCliente = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Soft delete - apenas desativa
    await db.query(
      'UPDATE clientes SET ativo = false WHERE id = ?',
      [id]
    );
    
    res.json({ message: 'Cliente desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar cliente:', error);
    res.status(500).json({ error: 'Erro ao desativar cliente' });
  }
};
