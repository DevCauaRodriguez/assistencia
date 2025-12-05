import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../lib/api';
import { Plus } from 'lucide-react';

interface Chamado {
  id: number;
  protocolo: string;
  titulo: string;
  status: string;
  prioridade: string;
  data_abertura: string;
  tecnico_nome: string;
  categoria_nome: string;
  nome_cliente: string;
}

const Chamados = () => {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadChamados();
  }, []);

  const loadChamados = async () => {
    try {
      const response = await api.get('/chamados');
      setChamados(response.data);
    } catch (error) {
      console.error('Erro ao carregar chamados:', error);
    } finally {
      setLoading(false);
    }
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
      imediata: 'bg-red-500 text-white',
      alta: 'bg-purple-600 text-white',
      media: 'bg-yellow-500 text-white',
      baixa: 'bg-green-500 text-white',
      programada: 'bg-blue-400 text-white'
    };
    return colors[prioridade] || 'bg-gray-500 text-white';
  };

  const formatStatus = (status: string) => {
    const labels: Record<string, string> = {
      aberto: 'Aberto',
      em_andamento: 'Em Andamento',
      aguardando_cliente: 'Aguardando',
      parado: 'Parado',
      cancelado: 'Cancelado',
      finalizado: 'Finalizado'
    };
    return labels[status] || status;
  };

  const formatPrioridade = (prioridade: string) => {
    const labels: Record<string, string> = {
      imediata: 'Imediata',
      alta: 'Alta',
      media: 'Média',
      baixa: 'Baixa',
      programada: 'Programada'
    };
    return labels[prioridade] || prioridade;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Chamados</h1>
          <button
            onClick={() => navigate('/novo-chamado')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo Chamado
          </button>
        </div>

        {/* Lista de Chamados - Mobile */}
        <div className="lg:hidden space-y-4">
          {chamados.map((chamado) => (
            <div
              key={chamado.id}
              onClick={() => navigate(`/chamados/${chamado.id}`)}
              className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-xs text-gray-500 mb-1">{chamado.protocolo}</div>
                  <div className="font-semibold text-gray-900">{chamado.titulo}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getPrioridadeColor(chamado.prioridade)}`}>
                  {formatPrioridade(chamado.prioridade)}
                </span>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600 mb-3">
                <div>Cliente: {chamado.nome_cliente}</div>
                <div>Categoria: {chamado.categoria_nome}</div>
                {chamado.tecnico_nome && <div>Técnico: {chamado.tecnico_nome}</div>}
                <div>Abertura: {formatDate(chamado.data_abertura)}</div>
              </div>

              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(chamado.status)}`}>
                {formatStatus(chamado.status)}
              </span>
            </div>
          ))}
        </div>

        {/* Tabela Desktop */}
        <div className="hidden lg:block bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Protocolo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioridade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Técnico
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Abertura
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chamados.map((chamado) => (
                <tr
                  key={chamado.id}
                  onClick={() => navigate(`/chamados/${chamado.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {chamado.protocolo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {chamado.titulo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {chamado.nome_cliente}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {chamado.categoria_nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getPrioridadeColor(chamado.prioridade)}`}>
                      {formatPrioridade(chamado.prioridade)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(chamado.status)}`}>
                      {formatStatus(chamado.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {chamado.tecnico_nome || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(chamado.data_abertura)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {chamados.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Nenhum chamado encontrado</p>
          </div>
        )}
      </div> 
    </Layout>
  );
};

export default Chamados;
