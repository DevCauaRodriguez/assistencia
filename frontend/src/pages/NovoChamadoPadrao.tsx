import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../lib/api';
import { ArrowLeft, Save } from 'lucide-react';

const NovoChamadoPadrao = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const categoria_id = location.state?.categoria_id;

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'media',
    empresa_id: '',
    nome_cliente: '',
    cpf_cnpj_cliente: '',
    telefone_cliente: '',
    cooperativa_cliente: '',
    localizacao: '',
    observacoes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoria_id) {
      alert('Categoria não especificada');
      return;
    }

    if (!formData.titulo || !formData.descricao || !formData.nome_cliente || !formData.empresa_id) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);

      // Auto-save do cliente se não existir
      if (formData.nome_cliente && formData.cpf_cnpj_cliente && formData.telefone_cliente) {
        try {
          // Verificar se cliente já existe
          const cpfCnpjNumeros = formData.cpf_cnpj_cliente.replace(/\D/g, '');
          await api.get(`/clientes/by-cpf?cpf_cnpj=${cpfCnpjNumeros}`);
        } catch (error: any) {
          // Cliente não existe, criar automaticamente
          if (error.response?.status === 404) {
            try {
              await api.post('/clientes', {
                nome: formData.nome_cliente,
                cpf_cnpj: formData.cpf_cnpj_cliente.replace(/\D/g, ''),
                telefone: formData.telefone_cliente.replace(/\D/g, ''),
                cooperativa: formData.cooperativa_cliente || null
              });
              console.log('Cliente criado automaticamente com sucesso');
            } catch (createError) {
              console.error('Erro ao criar cliente automaticamente:', createError);
              // Continuar mesmo se falhar a criação do cliente
            }
          }
        }
      }

      const response = await api.post('/chamados', {
        categoria_id,
        ...formData
      });
      alert(`Chamado aberto com sucesso! Protocolo: ${response.data.protocolo}`);
      navigate('/chamados');
    } catch (error: any) {
      console.error('Erro ao criar chamado:', error);
      const mensagem = error.response?.data?.message || 'Erro ao criar chamado. Tente novamente.';
      alert(mensagem);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/novo-chamado');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <h1 className="text-2xl font-bold mb-2">Novo Chamado</h1>
            <p className="text-blue-100">Preencha as informações do atendimento</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Título do chamado"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descreva o problema..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridade *
                </label>
                <select
                  name="prioridade"
                  value={formData.prioridade}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="imediata">Imediata</option>
                  <option value="programada">Programada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa Responsável *
                </label>
                <input
                  type="text"
                  name="empresa_id"
                  value={formData.empresa_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ID da empresa"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  name="nome_cliente"
                  value={formData.nome_cliente}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF/CNPJ
                </label>
                <input
                  type="text"
                  name="cpf_cnpj_cliente"
                  value={formData.cpf_cnpj_cliente}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="CPF ou CNPJ"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone do Cliente
                </label>
                <input
                  type="tel"
                  name="telefone_cliente"
                  value={formData.telefone_cliente}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cooperativa
                </label>
                <input
                  type="text"
                  name="cooperativa_cliente"
                  value={formData.cooperativa_cliente}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nome da cooperativa"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localização
              </label>
              <input
                type="text"
                name="localizacao"
                value={formData.localizacao}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Endereço completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Informações adicionais..."
              />
            </div>

            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 -mx-8 -mb-8 flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200"
              >
                <ArrowLeft size={20} />
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {loading ? 'Salvando...' : 'Salvar Chamado'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default NovoChamadoPadrao;
