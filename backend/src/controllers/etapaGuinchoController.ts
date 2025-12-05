import { Response } from 'express';
import db from '../config/database';
import { AuthRequest } from '../middlewares/authMiddleware';

// Configuração das etapas do guincho/reboque
const ETAPAS_GUINCHO = [
  { numero: 1, nome: 'Preenchimento de informações', prazo_minutos: 0 },
  { numero: 2, nome: 'Aguardando abertura na seguradora', prazo_minutos: 15 },
  { numero: 3, nome: 'Atendimento aberto - Aguardando prestador', prazo_minutos: 30 },
  { numero: 4, nome: 'Em andamento - Prestador localizado', prazo_minutos: 60 },
  { numero: 5, nome: 'Prestador no local de origem', prazo_minutos: 30 },
  { numero: 6, nome: 'Veículo em deslocamento ao destino', prazo_minutos: 0 }, // prazo calculado
  { numero: 7, nome: 'Veículo entregue', prazo_minutos: 0 }
];

export const criarEtapasGuidoReboque = async (chamado_id: number) => {
  try {
    for (const etapa of ETAPAS_GUINCHO) {
      await db.query(
        `INSERT INTO etapas_guincho (chamado_id, etapa_numero, etapa_nome, prazo_minutos, status)
         VALUES (?, ?, ?, ?, ?)`,
        [chamado_id, etapa.numero, etapa.nome, etapa.prazo_minutos, 
         etapa.numero === 1 ? 'concluida' : 'pendente']
      );
    }

    // Marcar etapa 1 como concluída
    await db.query(
      `UPDATE etapas_guincho 
       SET status = 'concluida', data_inicio = NOW(), data_conclusao = NOW()
       WHERE chamado_id = ? AND etapa_numero = 1`,
      [chamado_id]
    );

    // Iniciar etapa 2
    await iniciarProximaEtapa(chamado_id, 2);
  } catch (error) {
    console.error('Erro ao criar etapas:', error);
    throw error;
  }
};

const iniciarProximaEtapa = async (chamado_id: number, etapa_numero: number) => {
  const etapa = ETAPAS_GUINCHO.find(e => e.numero === etapa_numero);
  if (!etapa) return;

  const prazo_estimado = new Date();
  prazo_estimado.setMinutes(prazo_estimado.getMinutes() + etapa.prazo_minutos);

  await db.query(
    `UPDATE etapas_guincho 
     SET status = 'em_andamento', data_inicio = NOW(), prazo_estimado = ?
     WHERE chamado_id = ? AND etapa_numero = ?`,
    [prazo_estimado, chamado_id, etapa_numero]
  );

  await db.query(
    `UPDATE chamados SET etapa_atual = ? WHERE id = ?`,
    [etapa_numero, chamado_id]
  );
};

export const getEtapasGuidoReboque = async (req: AuthRequest, res: Response) => {
  try {
    const { chamado_id } = req.params;

    const [etapas] = await db.query(
      `SELECT * FROM etapas_guincho 
       WHERE chamado_id = ? 
       ORDER BY etapa_numero`,
      [chamado_id]
    );

    res.json(etapas);
  } catch (error) {
    console.error('Erro ao buscar etapas:', error);
    res.status(500).json({ message: 'Erro ao buscar etapas' });
  }
};

export const avancarEtapaGuidoReboque = async (req: AuthRequest, res: Response) => {
  try {
    const { chamado_id } = req.params;
    const { etapa_numero, protocolo_seguradora, tempo_estimado_manual, observacoes } = req.body;

    // Concluir etapa atual
    await db.query(
      `UPDATE etapas_guincho 
       SET status = 'concluida', data_conclusao = NOW(), 
           protocolo_seguradora = ?, observacoes = ?
       WHERE chamado_id = ? AND etapa_numero = ?`,
      [protocolo_seguradora || null, observacoes || null, chamado_id, etapa_numero]
    );

    // Verificar se há próxima etapa
    const proxima_etapa = etapa_numero + 1;
    if (proxima_etapa <= ETAPAS_GUINCHO.length) {
      // Se for etapa 6 (deslocamento), usar tempo manual ou calcular
      if (proxima_etapa === 6 && tempo_estimado_manual) {
        const prazo_estimado = new Date();
        prazo_estimado.setMinutes(prazo_estimado.getMinutes() + tempo_estimado_manual);

        await db.query(
          `UPDATE etapas_guincho 
           SET status = 'em_andamento', data_inicio = NOW(), 
               prazo_estimado = ?, tempo_estimado_manual = ?
           WHERE chamado_id = ? AND etapa_numero = ?`,
          [prazo_estimado, tempo_estimado_manual, chamado_id, proxima_etapa]
        );
      } else {
        await iniciarProximaEtapa(parseInt(chamado_id as string), proxima_etapa);
      }

      // Atualizar status do chamado baseado na etapa
      let novo_status = 'em_andamento';
      if (proxima_etapa === 7) {
        novo_status = 'finalizado';
      }

      await db.query(
        `UPDATE chamados SET etapa_atual = ?, status = ? WHERE id = ?`,
        [proxima_etapa, novo_status, chamado_id]
      );
    }

    res.json({ message: 'Etapa avançada com sucesso' });
  } catch (error) {
    console.error('Erro ao avançar etapa:', error);
    res.status(500).json({ message: 'Erro ao avançar etapa' });
  }
};

export const atualizarProtocoloSeguradora = async (req: AuthRequest, res: Response) => {
  try {
    const { chamado_id } = req.params;
    const { protocolo_seguradora } = req.body;

    await db.query(
      `UPDATE etapas_guincho 
       SET protocolo_seguradora = ?
       WHERE chamado_id = ? AND etapa_numero = 2`,
      [protocolo_seguradora, chamado_id]
    );

    await db.query(
      `UPDATE chamados SET protocolo_seguradora = ? WHERE id = ?`,
      [protocolo_seguradora, chamado_id]
    );

    res.json({ message: 'Protocolo atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar protocolo:', error);
    res.status(500).json({ message: 'Erro ao atualizar protocolo' });
  }
};

export const atualizarTempoDeslocamento = async (req: AuthRequest, res: Response) => {
  try {
    const { chamado_id } = req.params;
    const { tempo_minutos } = req.body;

    const prazo_estimado = new Date();
    prazo_estimado.setMinutes(prazo_estimado.getMinutes() + tempo_minutos);

    await db.query(
      `UPDATE etapas_guincho 
       SET tempo_estimado_manual = ?, prazo_estimado = ?
       WHERE chamado_id = ? AND etapa_numero = 6`,
      [tempo_minutos, prazo_estimado, chamado_id]
    );

    res.json({ message: 'Tempo de deslocamento atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar tempo:', error);
    res.status(500).json({ message: 'Erro ao atualizar tempo de deslocamento' });
  }
};

export const verificarEtapasAtrasadas = async () => {
  try {
    await db.query(
      `UPDATE etapas_guincho 
       SET status = 'atrasada'
       WHERE status = 'em_andamento' 
       AND prazo_estimado < NOW()
       AND prazo_estimado IS NOT NULL`
    );
  } catch (error) {
    console.error('Erro ao verificar etapas atrasadas:', error);
  }
};

export const registrarAtualizacaoEtapa3 = async (req: AuthRequest, res: Response) => {
  try {
    const { chamado_id } = req.params;
    const { observacoes } = req.body;

    // A cada atualização na etapa 3, renovar prazo por 15 minutos
    const novo_prazo = new Date();
    novo_prazo.setMinutes(novo_prazo.getMinutes() + 15);

    await db.query(
      `UPDATE etapas_guincho 
       SET prazo_estimado = ?, observacoes = CONCAT(COALESCE(observacoes, ''), '\n', ?)
       WHERE chamado_id = ? AND etapa_numero = 3 AND status = 'em_andamento'`,
      [novo_prazo, `[${new Date().toLocaleString('pt-BR')}] ${observacoes}`, chamado_id]
    );

    res.json({ message: 'Atualização registrada, prazo renovado por 15 minutos' });
  } catch (error) {
    console.error('Erro ao registrar atualização:', error);
    res.status(500).json({ message: 'Erro ao registrar atualização' });
  }
};

export const finalizarChamadoAssistencia = async (req: AuthRequest, res: Response) => {
  try {
    const { chamado_id } = req.params;
    const { observacoes_finais } = req.body;

    // Concluir a última etapa (7)
    await db.query(
      `UPDATE etapas_guincho 
       SET status = 'concluida', data_conclusao = NOW(), observacoes = ?
       WHERE chamado_id = ? AND etapa_numero = 7`,
      [observacoes_finais || null, chamado_id]
    );

    // Finalizar o chamado completamente
    await db.query(
      `UPDATE chamados 
       SET status = 'finalizado', data_conclusao = NOW()
       WHERE id = ?`,
      [chamado_id]
    );

    res.json({ message: 'Chamado de assistência finalizado com sucesso' });
  } catch (error) {
    console.error('Erro ao finalizar chamado:', error);
    res.status(500).json({ message: 'Erro ao finalizar chamado de assistência' });
  }
};
