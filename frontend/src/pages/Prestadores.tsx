import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Truck } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Prestador {
  id: number;
  nome: string;
  cnpj: string;
  telefone: string | null;
  email: string | null;
  ativo: boolean;
}

const Prestadores = () => {
  const { user } = useAuth();
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Prestador | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    telefone: '',
    email: ''
  });

  useEffect(() => {
    loadPrestadores();
  }, []);

  const loadPrestadores = async () => {
    try {
      const response = await api.get('/prestadores');
      setPrestadores(response.data);
    } catch (error) {
      console.error('Erro ao carregar prestadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/prestadores/${editando.id}`, {
          ...formData,
          ativo: editando.ativo
        });
      } else {
        await api.post('/prestadores', formData);
      }
      loadPrestadores();
      handleCloseModal();
    } catch (error: any) {
      console.error('Erro ao salvar prestador:', error);
      const mensagem = error.response?.data?.message || 'Erro ao salvar prestador';
      alert(mensagem);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja realmente inativar este prestador?')) {
      try {
        const prestador = prestadores.find(p => p.id === id);
        if (prestador) {
          await api.put(`/prestadores/${id}`, {
            ...prestador,
            ativo: false
          });
          loadPrestadores();
        }
      } catch (error) {
        console.error('Erro ao inativar prestador:', error);
        alert('Erro ao inativar prestador');
      }
    }
  };

  const handleEdit = (prestador: Prestador) => {
    setEditando(prestador);
    setFormData({
      nome: prestador.nome,
      cnpj: prestador.cnpj,
      telefone: prestador.telefone || '',
      email: prestador.email || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditando(null);
    setFormData({
      nome: '',
      cnpj: '',
      telefone: '',
      email: ''
    });
  };

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  const formatTelefone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Truck className="text-green-600" size={28} />
            </div>
            Prestadores de Serviços
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Gerencie os prestadores de serviços cadastrados no sistema
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
        >
          <Plus size={20} />
          Novo Prestador
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total de Prestadores</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{prestadores.length}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Truck className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Prestadores Ativos</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {prestadores.filter(p => p.ativo).length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Truck className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Prestadores Inativos</p>
              <p className="text-3xl font-bold text-gray-400 mt-1">
                {prestadores.filter(p => !p.ativo).length}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <Truck className="text-gray-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Nome/Razão Social
                </th>
                <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  CNPJ
                </th>
                <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {prestadores.map((prestador) => (
                <tr key={prestador.id} className="hover:bg-green-50/30 transition-colors duration-150">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${prestador.ativo ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Truck className={prestador.ativo ? 'text-green-600' : 'text-gray-400'} size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{prestador.nome}</div>
                        <div className="md:hidden text-xs text-gray-500 mt-1">{formatCNPJ(prestador.cnpj)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-5">
                    <span className="text-sm font-medium text-gray-900">{formatCNPJ(prestador.cnpj)}</span>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-5">
                    <span className="text-sm text-gray-600">
                      {prestador.telefone ? formatTelefone(prestador.telefone) : '-'}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-5">
                    <span className="text-sm text-gray-600">{prestador.email || '-'}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full ${
                      prestador.ativo 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${prestador.ativo ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      {prestador.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(prestador)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-150"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      {user?.perfil === 'administrador' && prestador.ativo && (
                        <button
                          onClick={() => handleDelete(prestador.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                          title="Inativar"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {prestadores.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Truck className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 font-medium">Nenhum prestador cadastrado</p>
            <p className="text-sm text-gray-400 mt-1">Clique em "Novo Prestador" para adicionar</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <Truck className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editando ? 'Editar Prestador' : 'Novo Prestador'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {editando ? 'Atualize os dados do prestador' : 'Preencha os dados para cadastrar'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome/Razão Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Ex: Guincho Rápido Ltda"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CNPJ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 font-mono"
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Telefone <span className="text-gray-400 text-xs font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: formatTelefone(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 font-mono"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-gray-400 text-xs font-normal">(opcional)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="contato@prestador.com.br"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full sm:flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {editando ? 'Atualizar Prestador' : 'Criar Prestador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
};

export default Prestadores;
