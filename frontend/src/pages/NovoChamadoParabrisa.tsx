import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../lib/api';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Empresa {
  id: number;
  nome: string;
}

interface Usuario {
  id: number;
  nome: string;
  ativo: boolean;
}

const NovoChamadoParabrisa = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const categoria_id = location.state?.categoria_id;
  const tipo_veiculo_inicial = location.state?.tipo_veiculo || '';

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [anexos, setAnexos] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'media',
    empresa_id: '',
    nome_cliente: '',
    cpf_cnpj_cliente: '',
    telefone_cliente: '',
    cooperativa_cliente: '',
    tecnico_responsavel_id: '',
    endereco_origem: '',
    marca_veiculo: '',
    modelo_veiculo: '',
    placa_veiculo: '',
    tipo_veiculo: tipo_veiculo_inicial,
    data_hora_atendimento: '',
    vidro_danificado: '',
    vidro_modelo: '',
    vidro_sensor: '',
    cidade_troca: '',
    dia_horario_troca: '',
    filme_protecao: '',
    veiculo_blindado: ''
  });

  useEffect(() => {
    if (!categoria_id) {
      navigate('/novo-chamado');
      return;
    }
    loadData();
  }, [categoria_id, user]);

  const loadData = async () => {
    try {
      const [empResponse] = await Promise.all([
        api.get('/empresas')
      ]);
      setEmpresas(empResponse.data);

      if (user?.perfil === 'administrador') {
        const usuResponse = await api.get('/usuarios');
        setUsuarios(usuResponse.data.filter((u: Usuario) => u.ativo));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados do formulário');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAnexos([...anexos, ...Array.from(e.target.files)]);
    }
  };

  const removeAnexo = (index: number) => {
    setAnexos(anexos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tipo_veiculo) {
      alert('Erro: tipo de veículo não foi selecionado');
      return;
    }

    if (anexos.length === 0) {
      alert('Por favor, anexe pelo menos uma foto do veículo e/ou local da ocorrência');
      return;
    }

    setLoading(true);

    try {
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
            }
          }
        }
      }

      const response = await api.post('/chamados', {
        ...formData,
        categoria_id,
        titulo: `Para-brisa - ${formData.placa_veiculo || 'Sem placa'}`,
        localizacao_origem: formData.endereco_origem
      });

      // Upload dos anexos
      if (anexos.length > 0) {
        for (const file of anexos) {
          try {
            const formDataAnexo = new FormData();
            formDataAnexo.append('arquivo', file);

            await api.post(`/chamados/${response.data.id}/anexos`, formDataAnexo, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
          } catch (anexoError) {
            console.error('Erro ao fazer upload de anexo:', anexoError);
          }
        }
      }

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
    navigate('/novo-chamado/selecao-tipo-veiculo-parabrisa', { 
      state: { categoria_id } 
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <h1 className="text-2xl font-bold mb-2">Para-brisa - {formData.tipo_veiculo === 'passeio' ? 'Veículo de Passeio' : 'Rebocador/Truck'}</h1>
            <p className="text-blue-100">Etapa 2 de 2 — Preencha os dados para abertura do chamado</p>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Dados da Empresa */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados da Seguradora</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa Responsável *
                </label>
                <select
                  name="empresa_id"
                  value={formData.empresa_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Selecione...</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dados do Cliente */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
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
                    required
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
            </div>

            {/* Dados do Veículo */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Veículo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca do Veículo *
                  </label>
                  <input
                    type="text"
                    name="marca_veiculo"
                    value={formData.marca_veiculo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Toyota, Honda"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo do Veículo *
                  </label>
                  <input
                    type="text"
                    name="modelo_veiculo"
                    value={formData.modelo_veiculo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Corolla, Civic"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Placa do Veículo *
                  </label>
                  <input
                    type="text"
                    name="placa_veiculo"
                    value={formData.placa_veiculo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ABC-1234"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Informações Complementares - Para-brisa */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Complementares</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data e Hora do Atendimento *
                  </label>
                  <input
                    type="datetime-local"
                    name="data_hora_atendimento"
                    value={formData.data_hora_atendimento}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo do Vidro é Verde ou Degradê? *
                  </label>
                  <select
                    name="vidro_modelo"
                    value={formData.vidro_modelo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="verde">Verde</option>
                    <option value="degrade">Degradê</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo do Vidro tem Sensor? *
                  </label>
                  <select
                    name="vidro_sensor"
                    value={formData.vidro_sensor}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qual Cidade Deseja Realizar a Troca? *
                  </label>
                  <input
                    type="text"
                    name="cidade_troca"
                    value={formData.cidade_troca}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nome da cidade"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qual Dia e Horário Gostaria de Realizar a Troca? *
                  </label>
                  <input
                    type="text"
                    name="dia_horario_troca"
                    value={formData.dia_horario_troca}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Segunda-feira, 14h"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Informações Específicas - Veículo de Passeio */}
            {formData.tipo_veiculo === 'passeio' && (
              <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Específicas - Veículo de Passeio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qual Vidro Danificado? *
                    </label>
                    <select
                      name="vidro_danificado"
                      value={formData.vidro_danificado}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Selecione...</option>
                      <option value="vidro_dianteiro_esquerdo">Vidro Dianteiro Esquerdo (Motorista)</option>
                      <option value="vidro_dianteiro_direito">Vidro Dianteiro Direito (Caroneiro)</option>
                      <option value="vidro_traseiro_esquerdo">Vidro Traseiro Esquerdo</option>
                      <option value="vidro_traseiro_direito">Vidro Traseiro Direito</option>
                      <option value="parabrisa">Para-brisa</option>
                      <option value="vidro_vigia">Vidro Vigia (Traseiro do Carro)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carro tem Película? *
                    </label>
                    <select
                      name="filme_protecao"
                      value={formData.filme_protecao}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Selecione...</option>
                      <option value="sim">Sim</option>
                      <option value="nao">Não</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Veículo é Blindado? *
                    </label>
                    <select
                      name="veiculo_blindado"
                      value={formData.veiculo_blindado}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Selecione...</option>
                      <option value="sim">Sim</option>
                      <option value="nao">Não</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Descrição */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Descrição do Atendimento</h3>
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
                  placeholder="Descreva a situação do vidro e outros detalhes importantes..."
                  required
                />
              </div>
            </div>

            {/* Prioridade */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prioridade</h3>
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
              </select>
            </div>

            {/* Anexos */}
            <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Upload size={20} className="text-amber-600" />
                Anexar Fotos do Veículo/Local *
              </h3>
              <p className="text-sm text-amber-700 mb-4">
                É obrigatório anexar pelo menos uma foto do veículo e/ou local da ocorrência
              </p>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />

              {anexos.length > 0 && (
                <div className="mt-4 space-y-2">
                  {anexos.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                      <span className="text-sm text-gray-600">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAnexo(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Técnico Responsável (apenas para admin) */}
            {user?.perfil === 'administrador' && (
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Técnico Responsável</h3>
                <select
                  name="tecnico_responsavel_id"
                  value={formData.tecnico_responsavel_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione...</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
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
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Salvar Chamado'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default NovoChamadoParabrisa;
