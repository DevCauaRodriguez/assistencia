import { Response } from 'express';
import db from '../config/database';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getDashboardMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const { periodo = 'mes', mes } = req.query;
    const dataReferencia = mes ? new Date(mes as string) : new Date();

    // Chamados por prioridade (em aberto)
    const [prioridades]: any = await db.query(`
      SELECT 
        prioridade,
        COUNT(*) as total
      FROM chamados
      WHERE status = 'aberto'
      GROUP BY prioridade
    `);

    // Status geral dos chamados
    const [statusGeral]: any = await db.query(`
      SELECT 
        status,
        COUNT(*) as total
      FROM chamados
      GROUP BY status
    `);

    // Chamados por técnico (em aberto e em andamento)
    const [porTecnico]: any = await db.query(`
      SELECT 
        u.nome as tecnico,
        COUNT(*) as total
      FROM chamados c
      LEFT JOIN usuarios u ON c.tecnico_responsavel_id = u.id
      WHERE c.status IN ('aberto', 'em_andamento')
      GROUP BY u.nome
    `);

    // Chamados por categoria
    const [porCategoria]: any = await db.query(`
      SELECT 
        cat.nome as categoria,
        COUNT(*) as total
      FROM chamados c
      INNER JOIN categorias cat ON c.categoria_id = cat.id
      GROUP BY cat.nome
      ORDER BY total DESC
    `);

    // Chamados por seguradora
    const [porSeguradora]: any = await db.query(`
      SELECT 
        e.nome as seguradora,
        COUNT(*) as total
      FROM chamados c
      INNER JOIN empresas e ON c.empresa_id = e.id
      GROUP BY e.nome
      ORDER BY total DESC
    `);

    // Chamados por cliente
    const [porCliente]: any = await db.query(`
      SELECT 
        nome_cliente as cliente,
        COUNT(*) as total
      FROM chamados
      WHERE nome_cliente IS NOT NULL AND nome_cliente != ''
      GROUP BY nome_cliente
      ORDER BY total DESC
    `);

    // Chamados por tipo de veículo
    const [porTipoVeiculo]: any = await db.query(`
      SELECT 
        tipo_veiculo,
        COUNT(*) as total
      FROM chamados
      WHERE tipo_veiculo IS NOT NULL AND tipo_veiculo != ''
      GROUP BY tipo_veiculo
      ORDER BY total DESC
    `);

    // Tempo médio por etapa
    const [tempoEtapas]: any = await db.query(`
      SELECT 
        AVG(TIMESTAMPDIFF(MINUTE, data_abertura, data_inicio_atendimento)) as abertura_para_inicio,
        AVG(TIMESTAMPDIFF(MINUTE, data_inicio_atendimento, data_conclusao)) as inicio_para_conclusao,
        AVG(TIMESTAMPDIFF(MINUTE, data_abertura, data_conclusao)) as tempo_total
      FROM chamados
      WHERE data_inicio_atendimento IS NOT NULL AND data_conclusao IS NOT NULL
    `);

    // Gráfico mensal/trimestral/semestral/anual
    let graficoQuery = '';
    const ano = dataReferencia.getFullYear();
    const mesNum = dataReferencia.getMonth() + 1;

    if (periodo === 'mes') {
      graficoQuery = `
        SELECT 
          DAY(data_abertura) as dia,
          CONCAT('Dia ', DAY(data_abertura)) as mes,
          COUNT(*) as total
        FROM chamados
        WHERE YEAR(data_abertura) = ${ano} AND MONTH(data_abertura) = ${mesNum}
        GROUP BY DAY(data_abertura), CONCAT('Dia ', DAY(data_abertura))
        ORDER BY dia
      `;
    } else if (periodo === 'trimestre') {
      const trimestre = Math.floor((mesNum - 1) / 3);
      const mesInicio = trimestre * 3 + 1;
      const mesFim = mesInicio + 2;
      graficoQuery = `
        SELECT 
          MONTH(data_abertura) as mes_num,
          DATE_FORMAT(data_abertura, '%b') as mes,
          COUNT(*) as total
        FROM chamados
        WHERE YEAR(data_abertura) = ${ano} AND MONTH(data_abertura) BETWEEN ${mesInicio} AND ${mesFim}
        GROUP BY MONTH(data_abertura)
        ORDER BY mes_num
      `;
    } else if (periodo === 'semestre') {
      const semestre = mesNum <= 6 ? 1 : 2;
      const mesInicio = semestre === 1 ? 1 : 7;
      const mesFim = semestre === 1 ? 6 : 12;
      graficoQuery = `
        SELECT 
          MONTH(data_abertura) as mes_num,
          DATE_FORMAT(data_abertura, '%b') as mes,
          COUNT(*) as total
        FROM chamados
        WHERE YEAR(data_abertura) = ${ano} AND MONTH(data_abertura) BETWEEN ${mesInicio} AND ${mesFim}
        GROUP BY MONTH(data_abertura)
        ORDER BY mes_num
      `;
    } else { // ano
      graficoQuery = `
        SELECT 
          MONTH(data_abertura) as mes_num,
          DATE_FORMAT(data_abertura, '%b') as mes,
          COUNT(*) as total
        FROM chamados
        WHERE YEAR(data_abertura) = ${ano}
        GROUP BY MONTH(data_abertura)
        ORDER BY mes_num
      `;
    }

    const [graficoMensal]: any = await db.query(graficoQuery);

    res.json({
      prioridades,
      statusGeral,
      porTecnico,
      porCategoria,
      porSeguradora,
      porCliente,
      porTipoVeiculo,
      tempoMedioPorEtapa: {
        abertura_para_inicio: Math.round(tempoEtapas[0]?.abertura_para_inicio || 0),
        inicio_para_conclusao: Math.round(tempoEtapas[0]?.inicio_para_conclusao || 0),
        tempo_total: Math.round(tempoEtapas[0]?.tempo_total || 0)
      },
      graficoMensal
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    res.status(500).json({ message: 'Erro ao buscar métricas do dashboard' });
  }
};

export const getChamadosAtrasados = async (req: AuthRequest, res: Response) => {
  try {
    const [chamadosAtrasados]: any = await db.query(`
      SELECT 
        c.id,
        c.protocolo,
        c.titulo,
        c.nome_cliente,
        c.telefone_cliente,
        c.prioridade,
        c.data_abertura,
        c.sla_prazo,
        e.nome as empresa_nome,
        cat.nome as categoria_nome,
        u.nome as tecnico_nome,
        TIMESTAMPDIFF(MINUTE, c.sla_prazo, NOW()) as minutos_atraso
      FROM chamados c
      LEFT JOIN empresas e ON c.empresa_id = e.id
      LEFT JOIN categorias cat ON c.categoria_id = cat.id
      LEFT JOIN usuarios u ON c.tecnico_responsavel_id = u.id
      WHERE c.status IN ('aberto', 'em_andamento', 'aguardando_cliente')
        AND c.sla_prazo IS NOT NULL
        AND c.sla_prazo < NOW()
      ORDER BY minutos_atraso DESC
    `);

    res.json(chamadosAtrasados);
  } catch (error) {
    console.error('Erro ao buscar chamados atrasados:', error);
    res.status(500).json({ message: 'Erro ao buscar chamados atrasados' });
  }
};
