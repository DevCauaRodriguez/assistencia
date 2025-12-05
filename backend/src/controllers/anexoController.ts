import { Request, Response } from 'express';
import db from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import path from 'path';
import fs from 'fs';

interface AuthRequest extends Request {
  userId?: number;
}

interface AnexoRow extends RowDataPacket {
  id: number;
  chamado_id: number;
  nome_arquivo: string;
  nome_original: string;
  caminho_arquivo: string;
  tipo_arquivo: string;
  tamanho: number;
  usuario_upload_id: number;
  usuario_nome: string;
  created_at: string;
}

// Listar anexos de um chamado
export const getAnexosChamado = async (req: AuthRequest, res: Response) => {
  try {
    const { chamado_id } = req.params;

    const [anexos] = await db.query<AnexoRow[]>(
      `SELECT 
        a.*,
        u.nome as usuario_nome
      FROM chamado_anexos a
      LEFT JOIN usuarios u ON a.usuario_upload_id = u.id
      WHERE a.chamado_id = ?
      ORDER BY a.created_at DESC`,
      [chamado_id]
    );

    res.json(anexos);
  } catch (error) {
    console.error('Erro ao buscar anexos:', error);
    res.status(500).json({ message: 'Erro ao buscar anexos' });
  }
};

// Upload de anexos
export const uploadAnexo = async (req: AuthRequest, res: Response) => {
  try {
    const { chamado_id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo foi enviado' });
    }

    const { filename, originalname, mimetype, size, path: filepath } = req.file;

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO chamado_anexos (
        chamado_id, nome_arquivo, nome_original, caminho_arquivo, 
        tipo_arquivo, tamanho, usuario_upload_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [chamado_id, filename, originalname, filepath, mimetype, size, req.userId]
    );

    const [anexo] = await db.query<AnexoRow[]>(
      `SELECT 
        a.*,
        u.nome as usuario_nome
      FROM chamado_anexos a
      LEFT JOIN usuarios u ON a.usuario_upload_id = u.id
      WHERE a.id = ?`,
      [result.insertId]
    );

    res.status(201).json(anexo[0]);
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ message: 'Erro ao fazer upload do arquivo' });
  }
};

// Download de anexo
export const downloadAnexo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [anexos] = await db.query<AnexoRow[]>(
      'SELECT * FROM chamado_anexos WHERE id = ?',
      [id]
    );

    if (anexos.length === 0) {
      return res.status(404).json({ message: 'Anexo não encontrado' });
    }

    const anexo = anexos[0];
    const filePath = path.resolve(anexo.caminho_arquivo);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Arquivo não encontrado no servidor' });
    }

    res.download(filePath, anexo.nome_original);
  } catch (error) {
    console.error('Erro ao fazer download:', error);
    res.status(500).json({ message: 'Erro ao fazer download do arquivo' });
  }
};

// Deletar anexo
export const deleteAnexo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [anexos] = await db.query<AnexoRow[]>(
      'SELECT * FROM chamado_anexos WHERE id = ?',
      [id]
    );

    if (anexos.length === 0) {
      return res.status(404).json({ message: 'Anexo não encontrado' });
    }

    const anexo = anexos[0];
    
    // Deletar arquivo do sistema
    const filePath = path.resolve(anexo.caminho_arquivo);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Deletar registro do banco
    await db.query('DELETE FROM chamado_anexos WHERE id = ?', [id]);

    res.json({ message: 'Anexo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar anexo:', error);
    res.status(500).json({ message: 'Erro ao deletar anexo' });
  }
};
