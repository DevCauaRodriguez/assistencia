import { Response } from 'express';
import db from '../config/database';
import { AuthRequest } from '../middlewares/authMiddleware';
import { criarEtapasGuidoReboque } from './etapaGuinchoController';

const gerarProtocolo = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CH${timestamp}${random}`;
};

const calcularSLA = async (prioridade: string): Promise<Date> => {
  const [rows]: any = await db.query(
    'SELECT tempo_resolucao_minutos FROM sla_config WHERE prioridade = ?',
    [prioridade]
  );
  
  const minutos = rows[0]?.tempo_resolucao_minutos || 480;
  const sla = new Date();
  sla.setMinutes(sla.getMinutes() + minutos);
  return sla;
};

export const createChamado = async (req: AuthRequest, res: Response) => {
  try {
    const {
      titulo,
      descricao,
      prioridade,
      categoria_id,
      empresa_id,
      protocolo_seguradora,
      nome_cliente,
      telefone_cliente,
      cooperativa_cliente,
      criancas_menores_12,
      idosos_acima_65,
      tecnico_responsavel_id,
      localizacao,
      localizacao_origem,
      localizacao_destino,
      ponto_referencia,
      tipo_veiculo,
      placa_veiculo,
      marca_veiculo,
      modelo_veiculo,
      cor_veiculo,
      chassi_veiculo,
      transmissao_automatica,
      acessorios_veiculo,
      tipo_cavalo_mecanico,
      quantidade_eixos,
      comprimento,
      altura,
      tipo_teto,
      desatrelado,
      tipo_ocorrencia,
      tipo_pane,
      veiculo_vazio,
      rodas_pneus_livres,
      oficina_24h,
      necessita_taxi,
      observacoes
    } = req.body;

    const protocolo = gerarProtocolo();
    const sla_prazo = await calcularSLA(prioridade);

    // Técnico só pode criar chamados atribuídos a si mesmo
    let tecnicoId = tecnico_responsavel_id;
    if (req.userPerfil === 'tecnico') {
      tecnicoId = req.userId;
    }

    const [result]: any = await db.query(
      `INSERT INTO chamados (
        protocolo, titulo, descricao, prioridade, categoria_id, 
        empresa_id, protocolo_seguradora, nome_cliente, telefone_cliente,
        cooperativa_cliente, criancas_menores_12, idosos_acima_65,
        usuario_criador_id, tecnico_responsavel_id, sla_prazo,
        localizacao, localizacao_origem, localizacao_destino, ponto_referencia,
        tipo_veiculo, placa_veiculo, marca_veiculo, modelo_veiculo, cor_veiculo, chassi_veiculo,
        transmissao_automatica, acessorios_veiculo,
        tipo_cavalo_mecanico, quantidade_eixos, comprimento, altura, tipo_teto, desatrelado,
        tipo_ocorrencia, tipo_pane, veiculo_vazio, rodas_pneus_livres, oficina_24h, necessita_taxi,
        observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        protocolo, titulo, descricao, prioridade, categoria_id,
        empresa_id, protocolo_seguradora || null, nome_cliente, telefone_cliente,
        cooperativa_cliente || null, criancas_menores_12 || null, idosos_acima_65 || null,
        req.userId, tecnicoId || null, sla_prazo,
        localizacao || null, localizacao_origem || null, localizacao_destino || null, ponto_referencia || null,
        tipo_veiculo || null, placa_veiculo || null, marca_veiculo || null, modelo_veiculo || null, cor_veiculo || null, chassi_veiculo || null,
        transmissao_automatica || null, acessorios_veiculo || null,
        tipo_cavalo_mecanico || null, quantidade_eixos || null, comprimento || null, altura || null, tipo_teto || null, desatrelado || null,
        tipo_ocorrencia || null, tipo_pane || null, veiculo_vazio || null, rodas_pneus_livres || null, oficina_24h || null, necessita_taxi || null,
        observacoes || null
      ]
    );

    // Se for chamado de guincho/reboque, criar etapas automaticamente
    const [categoria]: any = await db.query(
      'SELECT nome FROM categorias WHERE id = ?',
      [categoria_id]
    );
    
    if (categoria.length > 0 && 
        (categoria[0].nome.toLowerCase().includes('guincho') || 
         categoria[0].nome.toLowerCase().includes('reboque'))) {
      await criarEtapasGuidoReboque(result.insertId);
    }

    res.status(201).json({
      message: 'Chamado criado com sucesso',
      id: result.insertId,
      protocolo
    });
  } catch (error) {
    console.error('Erro ao criar chamado:', error);
    res.status(500).json({ message: 'Erro ao criar chamado' });
  }
};

export const getChamados = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      status, 
      prioridade, 
      categoria, 
      tecnico, 
      data_inicio, 
      data_fim, 
      busca 
    } = req.query;

    let query = `
      SELECT 
        c.*,
        cat.nome as categoria_nome,
        e.nome as empresa_nome,
        u.nome as tecnico_nome,
        uc.nome as criador_nome
      FROM chamados c
      LEFT JOIN categorias cat ON c.categoria_id = cat.id
      LEFT JOIN empresas e ON c.empresa_id = e.id
      LEFT JOIN usuarios u ON c.tecnico_responsavel_id = u.id
      LEFT JOIN usuarios uc ON c.usuario_criador_id = uc.id
      WHERE 1=1
    `;

    const params: any[] = [];

    // Técnico só vê chamados atribuídos a ele
    if (req.userPerfil === 'tecnico') {
      query += ' AND c.tecnico_responsavel_id = ?';
      params.push(req.userId);
    }

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (prioridade) {
      query += ' AND c.prioridade = ?';
      params.push(prioridade);
    }

    if (categoria) {
      query += ' AND c.categoria_id = ?';
      params.push(categoria);
    }

    if (tecnico) {
      query += ' AND c.tecnico_responsavel_id = ?';
      params.push(tecnico);
    }

    if (data_inicio) {
      query += ' AND c.data_abertura >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      query += ' AND c.data_abertura <= ?';
      params.push(data_fim);
    }

    if (busca) {
      query += ' AND (c.protocolo LIKE ? OR c.titulo LIKE ? OR c.nome_cliente LIKE ?)';
      const buscaParam = `%${busca}%`;
      params.push(buscaParam, buscaParam, buscaParam);
    }

    query += ' ORDER BY c.data_abertura DESC';

    const [rows] = await db.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar chamados:', error);
    res.status(500).json({ message: 'Erro ao buscar chamados' });
  }
};

export const getChamadoById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [rows]: any = await db.query(
      `SELECT 
        c.*,
        cat.nome as categoria_nome,
        e.nome as empresa_nome,
        u.nome as tecnico_nome,
        uc.nome as criador_nome
      FROM chamados c
      LEFT JOIN categorias cat ON c.categoria_id = cat.id
      LEFT JOIN empresas e ON c.empresa_id = e.id
      LEFT JOIN usuarios u ON c.tecnico_responsavel_id = u.id
      LEFT JOIN usuarios uc ON c.usuario_criador_id = uc.id
      WHERE c.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Chamado não encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar chamado:', error);
    res.status(500).json({ message: 'Erro ao buscar chamado' });
  }
};

export const updateChamado = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, prioridade, categoria_id } = req.body;

    const [chamadoAtual]: any = await db.query('SELECT * FROM chamados WHERE id = ?', [id]);

    if (chamadoAtual.length === 0) {
      return res.status(404).json({ message: 'Chamado não encontrado' });
    }

    await db.query(
      'UPDATE chamados SET titulo = ?, descricao = ?, prioridade = ?, categoria_id = ? WHERE id = ?',
      [titulo, descricao, prioridade, categoria_id, id]
    );

    // Registrar histórico de alterações
    if (chamadoAtual[0].prioridade !== prioridade) {
      await db.query(
        `INSERT INTO historico_alteracoes 
        (chamado_id, usuario_id, tipo_alteracao, campo_alterado, valor_anterior, valor_novo) 
        VALUES (?, ?, 'prioridade', 'prioridade', ?, ?)`,
        [id, req.userId, chamadoAtual[0].prioridade, prioridade]
      );
    }

    res.json({ message: 'Chamado atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar chamado:', error);
    res.status(500).json({ message: 'Erro ao atualizar chamado' });
  }
};

export const updateStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [chamadoAtual]: any = await db.query('SELECT * FROM chamados WHERE id = ?', [id]);

    if (chamadoAtual.length === 0) {
      return res.status(404).json({ message: 'Chamado não encontrado' });
    }

    const updates: any = { status };

    if (status === 'em_andamento' && !chamadoAtual[0].data_inicio_atendimento) {
      updates.data_inicio_atendimento = new Date();
    }

    if (status === 'finalizado') {
      updates.data_conclusao = new Date();
      
      // Calcular tempo de resolução em minutos
      const inicio = chamadoAtual[0].data_inicio_atendimento || chamadoAtual[0].data_abertura;
      const fim = new Date();
      const tempoResolucao = Math.floor((fim.getTime() - new Date(inicio).getTime()) / (1000 * 60));
      updates.tempo_resolucao = tempoResolucao;
    }

    const setClauses = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    await db.query(
      `UPDATE chamados SET ${setClauses} WHERE id = ?`,
      [...values, id]
    );

    // Registrar histórico
    await db.query(
      `INSERT INTO historico_alteracoes 
      (chamado_id, usuario_id, tipo_alteracao, campo_alterado, valor_anterior, valor_novo) 
      VALUES (?, ?, 'status', 'status', ?, ?)`,
      [id, req.userId, chamadoAtual[0].status, status]
    );

    res.json({ message: 'Status atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ message: 'Erro ao atualizar status' });
  }
};

export const atribuirTecnico = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tecnico_id } = req.body;

    const [chamadoAtual]: any = await db.query('SELECT * FROM chamados WHERE id = ?', [id]);

    if (chamadoAtual.length === 0) {
      return res.status(404).json({ message: 'Chamado não encontrado' });
    }

    await db.query(
      'UPDATE chamados SET tecnico_responsavel_id = ? WHERE id = ?',
      [tecnico_id, id]
    );

    // Registrar histórico
    await db.query(
      `INSERT INTO historico_alteracoes 
      (chamado_id, usuario_id, tipo_alteracao, campo_alterado, valor_anterior, valor_novo) 
      VALUES (?, ?, 'atribuicao', 'tecnico_responsavel_id', ?, ?)`,
      [id, req.userId, chamadoAtual[0].tecnico_responsavel_id, tecnico_id]
    );

    res.json({ message: 'Técnico atribuído com sucesso' });
  } catch (error) {
    console.error('Erro ao atribuir técnico:', error);
    res.status(500).json({ message: 'Erro ao atribuir técnico' });
  }
};

export const addComentario = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { comentario } = req.body;

    const [result]: any = await db.query(
      'INSERT INTO comentarios (chamado_id, usuario_id, comentario) VALUES (?, ?, ?)',
      [id, req.userId, comentario]
    );

    res.status(201).json({ 
      message: 'Comentário adicionado com sucesso',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    res.status(500).json({ message: 'Erro ao adicionar comentário' });
  }
};

export const getComentarios = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT c.*, u.nome as usuario_nome, u.perfil
      FROM comentarios c
      INNER JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.chamado_id = ?
      ORDER BY c.created_at ASC`,
      [id]
    );

    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    res.status(500).json({ message: 'Erro ao buscar comentários' });
  }
};

export const getHistorico = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT h.*, u.nome as usuario_nome
      FROM historico_alteracoes h
      INNER JOIN usuarios u ON h.usuario_id = u.id
      WHERE h.chamado_id = ?
      ORDER BY h.created_at ASC`,
      [id]
    );

    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ message: 'Erro ao buscar histórico' });
  }
};
