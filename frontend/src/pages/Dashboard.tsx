import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../lib/api';
import { TrendingUp, Users, Building2, Car, Clock, X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

interface DashboardMetrics {
  prioridades: Array<{ prioridade: string; total: number }>;
  statusGeral: Array<{ status: string; total: number }>;
  porTecnico: Array<{ tecnico: string; total: number }>;
  porCategoria: Array<{ categoria: string; total: number }>;
  porSeguradora: Array<{ seguradora: string; total: number }>;
  porCliente: Array<{ cliente: string; total: number }>;
  porTipoVeiculo: Array<{ tipo_veiculo: string; total: number }>;
  tempoMedioResolucao: number;
  tempoMedioPorEtapa: {
    abertura_para_inicio: number;
    inicio_para_conclusao: number;
    tempo_total: number;
  };
  graficoMensal: Array<{ mes: string; total: number }>;
}

interface Empresa {
  id: number;
  nome: string;
  cnpj: string;
  telefone: string;
  email: string | null;
  ativo: boolean;
}

interface Chamado {
  id: number;
  protocolo: string;
  titulo: string;
  status: string;
  prioridade: string;
  data_abertura: string;
  nome_cliente: string;
  empresa_nome: string;
}

interface ChamadoAtrasado {
  id: number;
  protocolo: string;
  titulo: string;
  nome_cliente: string;
  telefone_cliente: string;
  prioridade: string;
  data_abertura: string;
  sla_prazo: string;
  empresa_nome: string;
  categoria_nome: string;
  tecnico_nome: string;
  minutos_atraso: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [chamadosFinalizados, setChamadosFinalizados] = useState<Chamado[]>([]);
  const [chamadosAtrasados, setChamadosAtrasados] = useState<ChamadoAtrasado[]>([]);
  const [filtros, setFiltros] = useState({
    data_inicio: '',
    data_fim: '',
    empresa_id: '',
    cliente: ''
  });
  const [periodoGrafico, setPeriodoGrafico] = useState<'mes' | 'trimestre' | 'semestre' | 'ano'>('mes');
  const [mesAtual, setMesAtual] = useState(new Date());

  useEffect(() => {
    loadMetrics();
    loadEmpresas();
    loadChamadosAtrasados();
  }, [periodoGrafico, mesAtual]);

  const loadMetrics = async () => {
    try {
      const params = new URLSearchParams({
        periodo: periodoGrafico,
        mes: mesAtual.toISOString()
      });
      const response = await api.get(`/dashboard/metrics?${params}`);
      setMetrics(response.data);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmpresas = async () => {
    try {
      const response = await api.get('/empresas');
      const empresasAtivas = response.data.filter((e: Empresa) => e.ativo);
      setEmpresas(empresasAtivas);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const loadChamadosAtrasados = async () => {
    try {
      const response = await api.get('/dashboard/chamados-atrasados');
      setChamadosAtrasados(response.data);
    } catch (error) {
      console.error('Erro ao carregar chamados atrasados:', error);
    }
  };

  const loadChamadosFinalizados = async () => {
    try {
      const params = new URLSearchParams({
        status: 'finalizado',
        ...filtros
      });
      const response = await api.get(`/chamados?${params}`);
      setChamadosFinalizados(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Erro ao carregar chamados finalizados:', error);
    }
  };

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value
    });
  };

  const aplicarFiltros = () => {
    loadChamadosFinalizados();
  };

  const mudarMes = (direcao: 'anterior' | 'proximo') => {
    const novaData = new Date(mesAtual);
    if (direcao === 'anterior') {
      novaData.setMonth(novaData.getMonth() - 1);
    } else {
      novaData.setMonth(novaData.getMonth() + 1);
    }
    setMesAtual(novaData);
  };

  const getPrioridadeCount = (prioridade: string) => {
    return metrics?.prioridades.find(p => p.prioridade === prioridade)?.total || 0;
  };

  const getStatusCount = (status: string) => {
    return metrics?.statusGeral.find(s => s.status === status)?.total || 0;
  };

  const formatarTempo = (minutos: number) => {
    if (minutos < 60) return `${Math.round(minutos)}min`;
    const horas = Math.floor(minutos / 60);
    const mins = Math.round(minutos % 60);
    return `${horas}h ${mins}min`;
  };

  const getMesAnoFormatado = () => {
    return mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const formatarTempoAtraso = (minutos: number) => {
    if (minutos < 60) return `${minutos}min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (horas < 24) return `${horas}h ${mins}min`;
    const dias = Math.floor(horas / 24);
    const horasRestantes = horas % 24;
    return `${dias}d ${horasRestantes}h`;
  };

  const getPrioridadeColor = (prioridade: string) => {
    const colors: Record<string, string> = {
      imediata: 'bg-red-100 text-red-700 border-red-200',
      alta: 'bg-purple-100 text-purple-700 border-purple-200',
      media: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      baixa: 'bg-green-100 text-green-700 border-green-200',
      programada: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return colors[prioridade] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getMaxGrafico = () => {
    if (!metrics?.graficoMensal) return 0;
    return Math.max(...metrics.graficoMensal.map(item => item.total));
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

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        {/* Painel de Chamados Atrasados */}
        {chamadosAtrasados.length > 0 && (
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertCircle size={24} />
                Chamados de Assistência com Atraso
              </h2>
              <span className="bg-white text-red-600 font-bold px-3 py-1 rounded-full text-sm">
                {chamadosAtrasados.length} {chamadosAtrasados.length === 1 ? 'Atrasado' : 'Atrasados'}
              </span>
            </div>
            
            <div className="p-4">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Protocolo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Categoria
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Seguradora
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Técnico
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Prioridade
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Tempo de Atraso
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {chamadosAtrasados.map((chamado) => (
                        <tr 
                          key={chamado.id}
                          onClick={() => navigate(`/chamados/${chamado.id}`)}
                          className="hover:bg-red-50 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{chamado.protocolo}</div>
                            <div className="text-xs text-gray-500">{chamado.titulo}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{chamado.nome_cliente}</div>
                            <div className="text-xs text-gray-500">{chamado.telefone_cliente}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-700">{chamado.categoria_nome}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-700">{chamado.empresa_nome}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-700">{chamado.tecnico_nome || 'Não atribuído'}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPrioridadeColor(chamado.prioridade)}`}>
                              {chamado.prioridade.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="text-red-500" size={16} />
                              <span className="text-sm font-bold text-red-600">
                                {formatarTempoAtraso(chamado.minutos_atraso)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controles do Gráfico */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => mudarMes('anterior')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-lg font-semibold capitalize">{getMesAnoFormatado()}</h3>
              <button
                onClick={() => mudarMes('proximo')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="flex gap-2">
              {(['mes', 'trimestre', 'semestre', 'ano'] as const).map((periodo) => (
                <button
                  key={periodo}
                  onClick={() => setPeriodoGrafico(periodo)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    periodoGrafico === periodo
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Gráfico de Barras */}
          <div className="h-64 flex items-end gap-2">
            {metrics?.graficoMensal?.map((item, index) => {
              const altura = (item.total / getMaxGrafico()) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative group w-full">
                    <div
                      className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                      style={{ height: `${altura}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.total} chamados
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">{item.mes}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chamados em Aberto por Prioridade */}
        <div>
          <h2 className="text-blue-600 font-bold mb-4 text-sm uppercase">
            CHAMADOS EM ABERTO POR PRIORIDADE
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { nome: 'Imediata', key: 'imediata', cor: 'text-red-500', bg: 'hover:bg-red-50' },
              { nome: 'Alta', key: 'alta', cor: 'text-purple-600', bg: 'hover:bg-purple-50' },
              { nome: 'Média', key: 'media', cor: 'text-yellow-500', bg: 'hover:bg-yellow-50' },
              { nome: 'Baixa', key: 'baixa', cor: 'text-green-500', bg: 'hover:bg-green-50' }
            ].map((prioridade) => (
              <div
                key={prioridade.key}
                className={`bg-white p-4 rounded-lg shadow text-center transition-all duration-200 cursor-pointer ${prioridade.bg} transform hover:scale-105`}
              >
                <div className="text-gray-600 text-sm mb-2">{prioridade.nome}</div>
                <div className={`text-4xl font-bold ${prioridade.cor}`}>
                  {getPrioridadeCount(prioridade.key)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Geral dos Chamados */}
        <div>
          <h2 className="text-blue-600 font-bold mb-4 text-sm uppercase">
            STATUS GERAL DOS CHAMADOS
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { nome: 'Em Aberto', key: 'aberto', cor: 'text-gray-600', bg: 'bg-white hover:bg-gray-50' },
              { nome: 'Em Andamento', key: 'em_andamento', cor: 'text-yellow-600', bg: 'bg-yellow-50 hover:bg-yellow-100' },
              { nome: 'Aguardando', key: 'aguardando_cliente', cor: 'text-cyan-600', bg: 'bg-cyan-50 hover:bg-cyan-100' },
              { nome: 'Parados', key: 'parado', cor: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100' },
              { nome: 'Cancelados', key: 'cancelado', cor: 'text-red-600', bg: 'bg-red-50 hover:bg-red-100' },
              { nome: 'Finalizados', key: 'finalizado', cor: 'text-green-600', bg: 'bg-green-50 hover:bg-green-100' }
            ].map((status) => (
              <div
                key={status.key}
                onClick={() => status.key === 'finalizado' && loadChamadosFinalizados()}
                className={`${status.bg} p-4 rounded-lg shadow text-center transition-all duration-200 transform hover:scale-105 ${
                  status.key === 'finalizado' ? 'cursor-pointer' : ''
                }`}
              >
                <div className={`text-5xl font-bold ${status.cor} mb-2`}>
                  {getStatusCount(status.key)}
                </div>
                <div className={`${status.cor} text-sm font-medium`}>{status.nome}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tempo Médio por Etapa */}
        <div>
          <h2 className="text-blue-600 font-bold mb-4 text-sm uppercase flex items-center gap-2">
            <Clock size={18} />
            TEMPO MÉDIO POR ETAPA DO ATENDIMENTO
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="text-gray-600 text-sm mb-2">Abertura → Início</div>
              <div className="text-3xl font-bold text-blue-600">
                {formatarTempo(metrics?.tempoMedioPorEtapa?.abertura_para_inicio || 0)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="text-gray-600 text-sm mb-2">Início → Conclusão</div>
              <div className="text-3xl font-bold text-green-600">
                {formatarTempo(metrics?.tempoMedioPorEtapa?.inicio_para_conclusao || 0)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="text-gray-600 text-sm mb-2">Tempo Total</div>
              <div className="text-3xl font-bold text-purple-600">
                {formatarTempo(metrics?.tempoMedioPorEtapa?.tempo_total || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ranking Seguradoras */}
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-600">
              <Building2 size={20} />
              Ranking de Seguradoras
            </h3>
            <div className="space-y-3">
              {metrics?.porSeguradora?.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium">{item.seguradora}</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{item.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ranking Clientes */}
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-600">
              <Users size={20} />
              Ranking de Clientes
            </h3>
            <div className="space-y-3">
              {metrics?.porCliente?.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-green-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium">{item.cliente}</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">{item.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ranking Categorias */}
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-600">
              <TrendingUp size={20} />
              Ranking de Categorias
            </h3>
            <div className="space-y-3">
              {metrics?.porCategoria?.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-purple-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium">{item.categoria}</span>
                  </div>
                  <span className="text-xl font-bold text-purple-600">{item.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ranking Tipo de Veículo */}
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-orange-600">
              <Car size={20} />
              Ranking de Tipo de Veículo
            </h3>
            <div className="space-y-3">
              {metrics?.porTipoVeiculo?.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium capitalize">{item.tipo_veiculo || 'Não informado'}</span>
                  </div>
                  <span className="text-xl font-bold text-orange-600">{item.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        

        {/* Modal Chamados Finalizados */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Chamados Finalizados</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-green-800 p-2 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Filtros */}
              <div className="p-6 border-b bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
                    <input
                      type="date"
                      name="data_inicio"
                      value={filtros.data_inicio}
                      onChange={handleFiltroChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
                    <input
                      type="date"
                      name="data_fim"
                      value={filtros.data_fim}
                      onChange={handleFiltroChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seguradora</label>
                    <select
                      name="empresa_id"
                      value={filtros.empresa_id}
                      onChange={handleFiltroChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Todas</option>
                      {empresas.map((empresa) => (
                        <option key={empresa.id} value={empresa.id}>{empresa.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                    <input
                      type="text"
                      name="cliente"
                      value={filtros.cliente}
                      onChange={handleFiltroChange}
                      placeholder="Nome do cliente"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <button
                  onClick={aplicarFiltros}
                  className="mt-4 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Aplicar Filtros
                </button>
              </div>

              {/* Lista de Chamados */}
              <div className="p-6 overflow-y-auto max-h-96">
                {chamadosFinalizados.length === 0 ? (
                  <p className="text-center text-gray-500">Nenhum chamado finalizado encontrado</p>
                ) : (
                  <div className="space-y-3">
                    {chamadosFinalizados.map((chamado) => (
                      <div
                        key={chamado.id}
                        onClick={() => navigate(`/chamados/${chamado.id}`)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{chamado.protocolo}</p>
                            <p className="text-sm text-gray-600">{chamado.titulo}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Cliente: {chamado.nome_cliente} | Seguradora: {chamado.empresa_nome}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500">
                              {new Date(chamado.data_abertura).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
