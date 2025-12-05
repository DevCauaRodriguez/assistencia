import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../lib/api';
import { ArrowLeft, Clock, User, Calendar, CheckCircle, AlertCircle, Paperclip, Download, Eye, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Chamado {
  id: number;
  protocolo: string;
  titulo: string;
  descricao: string;
  status: string;
  prioridade: string;
  categoria_nome: string;
  empresa_nome: string;
  protocolo_seguradora: string;
  nome_cliente: string;
  telefone_cliente: string;
  cooperativa_cliente: string;
  criancas_menores_12: string;
  idosos_acima_65: string;
  tecnico_nome: string;
  tecnico_responsavel_id: number;
  criador_nome: string;
  data_abertura: string;
  data_inicio_atendimento: string;
  data_conclusao: string;
  sla_prazo: string;
  tempo_resolucao: number;
  localizacao: string;
  localizacao_origem: string;
  localizacao_destino: string;
  ponto_referencia: string;
  tipo_veiculo: string;
  placa_veiculo: string;
  marca_veiculo: string;
  modelo_veiculo: string;
  cor_veiculo: string;
  chassi_veiculo: string;
  transmissao_automatica: string;
  acessorios_veiculo: string;
  tipo_cavalo_mecanico: string;
  quantidade_eixos: number;
  comprimento: string;
  altura: string;
  tipo_teto: string;
  desatrelado: string;
  tipo_ocorrencia: string;
  tipo_pane: string;
  veiculo_vazio: string;
  rodas_pneus_livres: string;
  oficina_24h: string;
  necessita_taxi: string;
  observacoes: string;
}

interface Comentario {
  id: number;
  comentario: string;
  usuario_nome: string;
  perfil: string;
  created_at: string;
}

interface Historico {
  id: number;
  tipo_alteracao: string;
  campo_alterado: string;
  valor_anterior: string;
  valor_novo: string;
  usuario_nome: string;
  created_at: string;
}

interface EtapaGuidoReboque {
  id: number;
  chamado_id: number;
  etapa_numero: number;
  etapa_nome: string;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'atrasada';
  data_inicio: string;
  data_conclusao: string;
  prazo_minutos: number;
  prazo_estimado: string;
  protocolo_seguradora: string;
  tempo_estimado_manual: number;
  observacoes: string;
}

interface Anexo {
  id: number;
  chamado_id: number;
  nome_arquivo: string;
  nome_original: string;
  tipo_arquivo: string;
  tamanho: number;
  usuario_nome: string;
  created_at: string;
}

const ChamadoDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chamado, setChamado] = useState<Chamado | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [novoStatus, setNovoStatus] = useState('');
  const [usuarios, setUsuarios] = useState<Array<{id: number; nome: string}>>([]);
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState<number | string>('');
  const [etapas, setEtapas] = useState<EtapaGuidoReboque[]>([]);
  const [protocoloSeguradora, setProtocoloSeguradora] = useState('');
  const [tempoDeslocamento, setTempoDeslocamento] = useState('');
  const [observacaoEtapa3, setObservacaoEtapa3] = useState('');
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChamado();
    loadComentarios();
    loadHistorico();
    loadUsuarios();
    loadEtapas();
    loadAnexos();
  }, [id]);

  const loadChamado = async () => {
    try {
      const response = await api.get(`/chamados/${id}`);
      setChamado(response.data);
      setNovoStatus(response.data.status);
      setTecnicoSelecionado(response.data.tecnico_responsavel_id || '');
    } catch (error) {
      console.error('Erro ao carregar chamado:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComentarios = async () => {
    try {
      const response = await api.get(`/chamados/${id}/comentarios`);
      setComentarios(response.data);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
  };

  const loadHistorico = async () => {
    try {
      const response = await api.get(`/chamados/${id}/historico`);
      setHistorico(response.data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const loadUsuarios = async () => {
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data.filter((u: any) => u.ativo));
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const loadEtapas = async () => {
    try {
      const response = await api.get(`/etapas-guincho/${id}`);
      setEtapas(response.data);
    } catch (error) {
      console.error('Erro ao carregar etapas:', error);
    }
  };

  const loadAnexos = async () => {
    try {
      const response = await api.get(`/chamados/${id}/anexos`);
      setAnexos(response.data);
    } catch (error) {
      console.error('Erro ao carregar anexos:', error);
    }
  };

  const handleDownloadAnexo = async (anexoId: number, nomeOriginal: string) => {
    try {
      const response = await api.get(`/anexos/${anexoId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nomeOriginal);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar anexo:', error);
      alert('Erro ao baixar arquivo');
    }
  };

  const handleDeleteAnexo = async (anexoId: number) => {
    if (!confirm('Deseja realmente excluir este anexo?')) return;
    
    try {
      await api.delete(`/anexos/${anexoId}`);
      loadAnexos();
    } catch (error) {
      console.error('Erro ao deletar anexo:', error);
      alert('Erro ao deletar anexo');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (tipo: string) => {
    if (tipo.startsWith('image/')) return '🖼️';
    if (tipo === 'application/pdf') return '📄';
    if (tipo.includes('word')) return '📝';
    if (tipo.includes('excel') || tipo.includes('sheet')) return '📊';
    return '📎';
  };

  const handleAvancarEtapa = async (etapa_numero: number) => {
    // Validação: Etapa 2 requer protocolo da seguradora
    if (etapa_numero === 2 && !protocoloSeguradora) {
      alert('❌ Atenção: É obrigatório preencher o Protocolo da Seguradora antes de avançar para a próxima etapa.');
      return;
    }

    // Validação: Etapa 6 requer tempo de deslocamento
    if (etapa_numero === 6 && !tempoDeslocamento) {
      alert('❌ Atenção: É obrigatório definir o tempo estimado de deslocamento antes de avançar para a próxima etapa.');
      return;
    }

    try {
      await api.post(`/etapas-guincho/${id}/avancar`, {
        etapa_numero,
        protocolo_seguradora: etapa_numero === 2 ? protocoloSeguradora : undefined,
        tempo_estimado_manual: etapa_numero === 6 ? parseInt(tempoDeslocamento) : undefined
      });
      loadEtapas();
      loadChamado();
      loadHistorico();
      
      // Limpar campos após avançar
      if (etapa_numero === 2) setProtocoloSeguradora('');
      if (etapa_numero === 6) setTempoDeslocamento('');
    } catch (error) {
      console.error('Erro ao avançar etapa:', error);
      alert('Erro ao avançar etapa');
    }
  };

  const handleAtualizarProtocolo = async () => {
    if (!protocoloSeguradora) {
      alert('Preencha o protocolo da seguradora');
      return;
    }
    try {
      await api.post(`/etapas-guincho/${id}/protocolo`, {
        protocolo_seguradora: protocoloSeguradora
      });
      loadEtapas();
      loadChamado();
      setProtocoloSeguradora('');
    } catch (error) {
      console.error('Erro ao atualizar protocolo:', error);
    }
  };

  const handleAtualizarTempoDeslocamento = async () => {
    if (!tempoDeslocamento) {
      alert('Preencha o tempo de deslocamento');
      return;
    }
    try {
      await api.post(`/etapas-guincho/${id}/tempo-deslocamento`, {
        tempo_minutos: parseInt(tempoDeslocamento)
      });
      loadEtapas();
      setTempoDeslocamento('');
    } catch (error) {
      console.error('Erro ao atualizar tempo:', error);
    }
  };

  const handleAtualizarEtapa3 = async () => {
    if (!observacaoEtapa3) {
      alert('Preencha a observação');
      return;
    }
    try {
      await api.post(`/etapas-guincho/${id}/atualizar-etapa3`, {
        observacoes: observacaoEtapa3
      });
      loadEtapas();
      setObservacaoEtapa3('');
      alert('Atualização registrada! Prazo renovado por 15 minutos.');
    } catch (error) {
      console.error('Erro ao atualizar etapa 3:', error);
    }
  };

  const handleAddComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoComentario.trim()) return;

    try {
      await api.post(`/chamados/${id}/comentarios`, { comentario: novoComentario });
      setNovoComentario('');
      loadComentarios();
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await api.patch(`/chamados/${id}/status`, { status: novoStatus });
      loadChamado();
      loadHistorico();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleAtribuirTecnico = async () => {
    if (!tecnicoSelecionado) {
      alert('Selecione um técnico');
      return;
    }
    try {
      await api.patch(`/chamados/${id}/atribuir`, { tecnico_id: tecnicoSelecionado });
      loadChamado();
      loadHistorico();
    } catch (error) {
      console.error('Erro ao atribuir técnico:', error);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      aberto: 'bg-gray-100 text-gray-800',
      em_andamento: 'bg-yellow-100 text-yellow-800',
      aguardando_cliente: 'bg-cyan-100 text-cyan-800',
      parado: 'bg-purple-100 text-purple-800',
      cancelado: 'bg-red-100 text-red-800',
      finalizado: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPrioridadeColor = (prioridade: string) => {
    const colors: Record<string, string> = {
      imediata: 'bg-red-500',
      alta: 'bg-purple-600',
      media: 'bg-yellow-500',
      baixa: 'bg-green-500',
      programada: 'bg-blue-400'
    };
    return colors[prioridade] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-lg">Carregando...</div>
        </div>
      </Layout>
    );
  }

  if (!chamado) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Chamado não encontrado</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/chamados')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Detalhes do Chamado</h1>
        </div>

        {/* Informações Principais */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Protocolo: {chamado.protocolo}</div>
              <h2 className="text-xl font-bold text-gray-900">{chamado.titulo}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(chamado.status)}`}>
                {chamado.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${getPrioridadeColor(chamado.prioridade)}`}>
                {chamado.prioridade.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Dados do Atendimento */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">Dados do Atendimento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Categoria</div>
                <div className="font-semibold">{chamado.categoria_nome}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Empresa/Seguradora</div>
                <div className="font-semibold">{chamado.empresa_nome}</div>
              </div>
              {chamado.protocolo_seguradora && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Protocolo Seguradora</div>
                  <div className="font-semibold">{chamado.protocolo_seguradora}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-500 mb-1">Técnico Responsável</div>
                <div className="font-semibold">{chamado.tecnico_nome || 'Não atribuído'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Criado por</div>
                <div className="font-semibold">{chamado.criador_nome}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  Data de Abertura
                </div>
                <div className="font-semibold">{formatDate(chamado.data_abertura)}</div>
              </div>
              {chamado.data_inicio_atendimento && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Clock className="w-4 h-4" />
                    Início do Atendimento
                  </div>
                  <div className="font-semibold">{formatDate(chamado.data_inicio_atendimento)}</div>
                </div>
              )}
              {chamado.data_conclusao && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Clock className="w-4 h-4" />
                    Data de Conclusão
                  </div>
                  <div className="font-semibold">{formatDate(chamado.data_conclusao)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">Dados do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Nome Completo</div>
                <div className="font-semibold">{chamado.nome_cliente}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Telefone</div>
                <div className="font-semibold">{chamado.telefone_cliente}</div>
              </div>
              {chamado.cooperativa_cliente && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Cooperativa</div>
                  <div className="font-semibold">{chamado.cooperativa_cliente}</div>
                </div>
              )}
              {chamado.criancas_menores_12 && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Crianças menores de 12 anos</div>
                  <div className="font-semibold">{chamado.criancas_menores_12 === 'sim' ? 'Sim' : 'Não'}</div>
                </div>
              )}
              {chamado.idosos_acima_65 && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Idosos acima de 65 anos</div>
                  <div className="font-semibold">{chamado.idosos_acima_65 === 'sim' ? 'Sim' : 'Não'}</div>
                </div>
              )}
            </div>
          </div>

          {/* Dados do Veículo */}
          {chamado.tipo_veiculo && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">Dados do Veículo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Tipo de Veículo</div>
                  <div className="font-semibold">
                    {chamado.tipo_veiculo === 'passeio' ? 'Passeio' : 'Rebocador/Truck'}
                  </div>
                </div>
                {chamado.placa_veiculo && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Placa</div>
                    <div className="font-semibold">{chamado.placa_veiculo}</div>
                  </div>
                )}
                {chamado.marca_veiculo && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Marca</div>
                    <div className="font-semibold">{chamado.marca_veiculo}</div>
                  </div>
                )}
                {chamado.modelo_veiculo && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Modelo</div>
                    <div className="font-semibold">{chamado.modelo_veiculo}</div>
                  </div>
                )}
                {chamado.cor_veiculo && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Cor</div>
                    <div className="font-semibold">{chamado.cor_veiculo}</div>
                  </div>
                )}
                {chamado.chassi_veiculo && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Chassi</div>
                    <div className="font-semibold">{chamado.chassi_veiculo}</div>
                  </div>
                )}
                {chamado.transmissao_automatica && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Transmissão Automática</div>
                    <div className="font-semibold">
                      {chamado.transmissao_automatica === 'sim' ? 'Sim' : 'Não'}
                    </div>
                  </div>
                )}
                {chamado.acessorios_veiculo && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Acessórios</div>
                    <div className="font-semibold">{chamado.acessorios_veiculo}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dados do Rebocador/Truck */}
          {chamado.tipo_veiculo === 'rebocador_truck' && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">Informações do Rebocador/Truck</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chamado.tipo_cavalo_mecanico && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Tipo</div>
                    <div className="font-semibold">
                      {chamado.tipo_cavalo_mecanico === 'cavalo_mecanico' ? 'Cavalo Mecânico' : 'Inteiro'}
                    </div>
                  </div>
                )}
                {chamado.quantidade_eixos && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Quantidade de Eixos</div>
                    <div className="font-semibold">{chamado.quantidade_eixos}</div>
                  </div>
                )}
                {chamado.comprimento && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Comprimento</div>
                    <div className="font-semibold">{chamado.comprimento} metros</div>
                  </div>
                )}
                {chamado.altura && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Altura</div>
                    <div className="font-semibold">{chamado.altura} metros</div>
                  </div>
                )}
                {chamado.tipo_teto && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Tipo de Teto</div>
                    <div className="font-semibold">
                      {chamado.tipo_teto === 'alto' ? 'Teto Alto' : 'Teto Baixo'}
                    </div>
                  </div>
                )}
                {chamado.desatrelado && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Desatrelado</div>
                    <div className="font-semibold">{chamado.desatrelado === 'sim' ? 'Sim' : 'Não'}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Localização */}
          {(chamado.localizacao_origem || chamado.localizacao_destino || chamado.ponto_referencia) && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">Localização</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chamado.localizacao_origem && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Endereço de Origem</div>
                    <div className="font-semibold">{chamado.localizacao_origem}</div>
                  </div>
                )}
                {chamado.localizacao_destino && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Endereço de Destino</div>
                    <div className="font-semibold">{chamado.localizacao_destino}</div>
                  </div>
                )}
                {chamado.ponto_referencia && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Ponto de Referência</div>
                    <div className="font-semibold">{chamado.ponto_referencia}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informações Complementares */}
          {(chamado.tipo_ocorrencia || chamado.tipo_pane || chamado.veiculo_vazio || chamado.rodas_pneus_livres || chamado.oficina_24h || chamado.necessita_taxi) && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">Informações Complementares</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chamado.tipo_ocorrencia && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Tipo de Ocorrência</div>
                    <div className="font-semibold">
                      {chamado.tipo_ocorrencia === 'pane' ? 'Pane' : 'Sinistro'}
                    </div>
                  </div>
                )}
                {chamado.tipo_pane && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Tipo de Pane</div>
                    <div className="font-semibold">{chamado.tipo_pane}</div>
                  </div>
                )}
                {chamado.veiculo_vazio && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Veículo Vazio</div>
                    <div className="font-semibold">{chamado.veiculo_vazio === 'sim' ? 'Sim' : 'Não'}</div>
                  </div>
                )}
                {chamado.rodas_pneus_livres && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Rodas/Pneus Livres</div>
                    <div className="font-semibold">{chamado.rodas_pneus_livres === 'sim' ? 'Sim' : 'Não'}</div>
                  </div>
                )}
                {chamado.oficina_24h && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Oficina 24h</div>
                    <div className="font-semibold">{chamado.oficina_24h === 'sim' ? 'Sim' : 'Não'}</div>
                  </div>
                )}
                {chamado.necessita_taxi && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Necessita Táxi</div>
                    <div className="font-semibold">{chamado.necessita_taxi === 'sim' ? 'Sim' : 'Não'}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Descrição e Observações */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">Descrição e Observações</h3>
            {chamado.descricao && (
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-2">Descrição</div>
                <div className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{chamado.descricao}</div>
              </div>
            )}
            {chamado.observacoes && (
              <div>
                <div className="text-sm text-gray-500 mb-2">Observações</div>
                <div className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{chamado.observacoes}</div>
              </div>
            )}
          </div>
        </div>

        {/* Atualizar Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Atualizar Status</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={novoStatus}
              onChange={(e) => setNovoStatus(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="aberto">Aberto</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="aguardando_cliente">Aguardando Cliente</option>
              <option value="parado">Parado</option>
              <option value="cancelado">Cancelado</option>
              <option value="finalizado">Finalizado</option>
            </select>
            <button
              onClick={handleUpdateStatus}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Atualizar
            </button>
          </div>
        </div>

        {/* Atribuir Técnico */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Atribuir Técnico</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={tecnicoSelecionado}
              onChange={(e) => setTecnicoSelecionado(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um técnico...</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nome}
                </option>
              ))}
            </select>
            <button
              onClick={handleAtribuirTecnico}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Atribuir
            </button>
          </div>
        </div>

        {/* Etapas do Guincho/Reboque */}
        {etapas.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-6">Etapas do Processo de Guincho/Reboque</h3>
            
            <div className="space-y-4">
              {etapas.map((etapa, index) => {
                const isAtrasada = etapa.status === 'atrasada';
                const isConcluida = etapa.status === 'concluida';
                const isEmAndamento = etapa.status === 'em_andamento';
                
                return (
                  <div 
                    key={etapa.id} 
                    className={`border-l-4 pl-6 py-4 relative ${
                      isAtrasada ? 'border-red-500 bg-red-50' : 
                      isConcluida ? 'border-green-500 bg-green-50' :
                      isEmAndamento ? 'border-blue-500 bg-blue-50' :
                      'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-gray-700">Etapa {etapa.etapa_numero}</span>
                          {isConcluida && <CheckCircle className="text-green-600" size={20} />}
                          {isAtrasada && <AlertCircle className="text-red-600" size={20} />}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isAtrasada ? 'bg-red-100 text-red-700' :
                            isConcluida ? 'bg-green-100 text-green-700' :
                            isEmAndamento ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {etapa.status === 'em_andamento' ? 'EM ANDAMENTO' :
                             etapa.status === 'concluida' ? 'CONCLUÍDA' :
                             etapa.status === 'atrasada' ? 'ATRASADA' :
                             'PENDENTE'}
                          </span>
                        </div>
                        
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {etapa.etapa_nome}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {etapa.data_inicio && (
                            <div>
                              <span className="text-gray-500">Início: </span>
                              <span className="font-medium">{formatDate(etapa.data_inicio)}</span>
                            </div>
                          )}
                          {etapa.data_conclusao && (
                            <div>
                              <span className="text-gray-500">Conclusão: </span>
                              <span className="font-medium">{formatDate(etapa.data_conclusao)}</span>
                            </div>
                          )}
                          {etapa.prazo_estimado && !isConcluida && (
                            <div>
                              <span className="text-gray-500">Prazo: </span>
                              <span className={`font-medium ${isAtrasada ? 'text-red-600' : ''}`}>
                                {formatDate(etapa.prazo_estimado)}
                              </span>
                            </div>
                          )}
                          {etapa.prazo_minutos > 0 && (
                            <div>
                              <span className="text-gray-500">Tempo previsto: </span>
                              <span className="font-medium">{etapa.prazo_minutos} minutos</span>
                            </div>
                          )}
                        </div>

                        {/* Campo protocolo para etapa 2 */}
                        {etapa.etapa_numero === 2 && isEmAndamento && (
                          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Protocolo da Seguradora *
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={protocoloSeguradora}
                                onChange={(e) => setProtocoloSeguradora(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Digite o protocolo..."
                              />
                              <button
                                onClick={handleAtualizarProtocolo}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                              >
                                Salvar
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Renovar prazo para etapa 3 */}
                        {etapa.etapa_numero === 3 && isEmAndamento && (
                          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Atualização (Renova prazo por 15 minutos)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={observacaoEtapa3}
                                onChange={(e) => setObservacaoEtapa3(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Descreva a atualização..."
                              />
                              <button
                                onClick={handleAtualizarEtapa3}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                              >
                                Atualizar
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Campo tempo manual para etapa 6 */}
                        {etapa.etapa_numero === 6 && isEmAndamento && (
                          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Tempo estimado de deslocamento (minutos)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={tempoDeslocamento}
                                onChange={(e) => setTempoDeslocamento(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Ex: 45"
                                min="1"
                              />
                              <button
                                onClick={handleAtualizarTempoDeslocamento}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                              >
                                Definir
                              </button>
                            </div>
                          </div>
                        )}

                        {etapa.observacoes && (
                          <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                            <span className="text-xs text-gray-500 font-semibold">Observações:</span>
                            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{etapa.observacoes}</p>
                          </div>
                        )}
                      </div>

                      {/* Botão avançar */}
                      {isEmAndamento && etapa.etapa_numero < 7 && (
                        <button
                          onClick={() => handleAvancarEtapa(etapa.etapa_numero)}
                          className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
                        >
                          Avançar Etapa
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Comentários */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Comentários</h3>
          
          <form onSubmit={handleAddComentario} className="mb-6">
            <textarea
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              placeholder="Adicione um comentário..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Adicionar Comentário
            </button>
          </form>

          <div className="space-y-4">
            {comentarios.map((comentario) => (
              <div key={comentario.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold text-gray-900">{comentario.usuario_nome}</span>
                  <span className="text-xs text-gray-500">
                    {formatDate(comentario.created_at)}
                  </span>
                </div>
                <div className="text-gray-700">{comentario.comentario}</div>
              </div>
            ))}
            {comentarios.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhum comentário ainda</p>
            )}
          </div>
        </div>

        {/* Anexos */}
        {anexos.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-6">
              <Paperclip className="w-5 h-5 text-gray-700" />
              <h3 className="font-bold text-gray-900">Anexos ({anexos.length})</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {anexos.map((anexo) => (
                <div key={anexo.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{getFileIcon(anexo.tipo_arquivo)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate" title={anexo.nome_original}>
                        {anexo.nome_original}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatFileSize(anexo.tamanho)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Por {anexo.usuario_nome}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(anexo.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleDownloadAnexo(anexo.id, anexo.nome_original)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                    >
                      <Download className="w-4 h-4" />
                      Baixar
                    </button>
                    {(user?.perfil === 'admin' || user?.perfil === 'gestor') && (
                      <button
                        onClick={() => handleDeleteAnexo(anexo.id)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Excluir anexo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Histórico */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Histórico de Alterações</h3>
          <div className="space-y-3">
            {historico.map((item) => (
              <div key={item.id} className="flex items-start gap-3 text-sm">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="text-gray-600">
                    <span className="font-semibold">{item.usuario_nome}</span> alterou{' '}
                    <span className="font-semibold">{item.campo_alterado}</span> de{' '}
                    <span className="text-gray-900">{item.valor_anterior}</span> para{' '}
                    <span className="text-gray-900">{item.valor_novo}</span>
                  </div>
                  <div className="text-xs text-gray-400">{formatDate(item.created_at)}</div>
                </div>
              </div>
            ))}
            {historico.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma alteração registrada</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChamadoDetalhes;
