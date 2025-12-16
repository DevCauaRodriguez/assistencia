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

const NovoChamadoGuinchoReboque = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const categoria_id = location.state?.categoria_id;
  const tipo_veiculo_inicial = location.state?.tipo_veiculo || '';

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [anexos, setAnexos] = useState<File[]>([]);
  const [anexoCRLV, setAnexoCRLV] = useState<File | null>(null);
  const [anexoCNH, setAnexoCNH] = useState<File | null>(null);
  const [anexosRebocador, setAnexosRebocador] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'media',
    empresa_id: '',
    protocolo_seguradora: '',
    nome_cliente: '',
    cpf_cnpj_cliente: '',
    telefone_cliente: '',
    cooperativa_cliente: '',
    criancas_menores_12: '',
    idosos_acima_65: '',
    tecnico_responsavel_id: '',
    endereco_origem: '',
    endereco_destino: '',
    ponto_referencia: '',
    marca_veiculo: '',
    modelo_veiculo: '',
    placa_veiculo: '',
    cor_veiculo: '',
    chassi_veiculo: '',
    transmissao_automatica: 'nao',
    acessorios_veiculo: '',
    tipo_veiculo: tipo_veiculo_inicial,
    tipo_cavalo_mecanico: '',
    quantidade_eixos: '',
    comprimento: '',
    altura: '',
    tipo_teto: '',
    desatrelado: 'nao',
    tipo_ocorrencia: '',
    tipo_pane: '',
    veiculo_vazio: '',
    rodas_pneus_livres: '',
    oficina_24h: '',
    necessita_taxi: ''
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

  const handleCRLVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAnexoCRLV(e.target.files[0]);
    }
  };

  const removeCRLV = () => {
    setAnexoCRLV(null);
  };

  const handleCNHChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAnexoCNH(e.target.files[0]);
    }
  };

  const removeCNH = () => {
    setAnexoCNH(null);
  };

  const handleRebocadorFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAnexosRebocador([...anexosRebocador, ...Array.from(e.target.files)]);
    }
  };

  const removeAnexoRebocador = (index: number) => {
    setAnexosRebocador(anexosRebocador.filter((_, i) => i !== index));
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

    if (formData.tipo_veiculo === 'rebocador_truck' && anexosRebocador.length === 0) {
      alert('Por favor, anexe fotos do veículo Rebocador/Truck');
      return;
    }

    setLoading(true);

    try {
      // Auto-save do solicitante se não existir
      if (formData.nome_cliente && formData.cpf_cnpj_cliente && formData.telefone_cliente) {
        try {
          // Verificar se solicitante já existe
          const cpfCnpjNumeros = formData.cpf_cnpj_cliente.replace(/\D/g, '');
          await api.get(`/solicitantes/by-cpf?cpf_cnpj=${cpfCnpjNumeros}`);
        } catch (error: any) {
          // Solicitante não existe, criar automaticamente
          if (error.response?.status === 404) {
            try {
              await api.post('/solicitantes', {
                nome: formData.nome_cliente,
                cpf_cnpj: formData.cpf_cnpj_cliente.replace(/\D/g, ''),
                telefone: formData.telefone_cliente.replace(/\D/g, ''),
                cooperativa: formData.cooperativa_cliente || null
              });
              console.log('Solicitante criado automaticamente com sucesso');
            } catch (createError) {
              console.error('Erro ao criar solicitante automaticamente:', createError);
              // Continuar mesmo se falhar a criação do cliente
            }
          }
        }
      }

      const response = await api.post('/chamados', {
        ...formData,
        categoria_id,
        titulo: `Guincho/Reboque - ${formData.placa_veiculo || 'Sem placa'}`,
        localizacao_origem: formData.endereco_origem,
        localizacao_destino: formData.endereco_destino
      });

      // Upload dos anexos (um por vez)
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

      // Upload do CRLV
      if (anexoCRLV) {
        try {
          const formDataCRLV = new FormData();
          formDataCRLV.append('arquivo', anexoCRLV);

          await api.post(`/chamados/${response.data.id}/anexos`, formDataCRLV, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        } catch (crlvError) {
          console.error('Erro ao fazer upload do CRLV:', crlvError);
        }
      }

      // Upload da CNH
      if (anexoCNH) {
        try {
          const formDataCNH = new FormData();
          formDataCNH.append('arquivo', anexoCNH);

          await api.post(`/chamados/${response.data.id}/anexos`, formDataCNH, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        } catch (cnhError) {
          console.error('Erro ao fazer upload da CNH:', cnhError);
        }
      }

      // Upload dos anexos do rebocador (um por vez)
      if (anexosRebocador.length > 0) {
        for (const file of anexosRebocador) {
          try {
            const formDataRebocador = new FormData();
            formDataRebocador.append('arquivo', file);

            await api.post(`/chamados/${response.data.id}/anexos`, formDataRebocador, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
          } catch (rebocadorError) {
            console.error('Erro ao fazer upload de anexo rebocador:', rebocadorError);
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
    navigate('/novo-chamado');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <h1 className="text-2xl font-bold mb-2">Guincho/Reboque - {formData.tipo_veiculo === 'passeio' ? 'Veículo de Passeio' : 'Rebocador/Truck'}</h1>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Solicitante</h3>
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
                    placeholder="Nome do cliente"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF/CNPJ *
                  </label>
                  <input
                    type="text"
                    name="cpf_cnpj_cliente"
                    value={formData.cpf_cnpj_cliente}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="CPF ou CNPJ do cliente"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
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
                    Cliente/Cooperativa
                  </label>
                  <input
                    type="text"
                    name="cooperativa_cliente"
                    value={formData.cooperativa_cliente}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nome do cliente/cooperativa"
                  />
                </div>
              </div>

              {/* Upload da CNH */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNH (Carteira Nacional de Habilitação)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleCNHChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {anexoCNH && (
                  <div className="mt-3 flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <span className="text-sm text-gray-700">{anexoCNH.name}</span>
                    <button
                      type="button"
                      onClick={removeCNH}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Dados do Veículo */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Veículo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca *
                  </label>
                  <input
                    type="text"
                    name="marca_veiculo"
                    value={formData.marca_veiculo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Fiat"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    name="modelo_veiculo"
                    value={formData.modelo_veiculo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Uno"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Placa *
                  </label>
                  <input
                    type="text"
                    name="placa_veiculo"
                    value={formData.placa_veiculo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ABC1234"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor *
                  </label>
                  <input
                    type="text"
                    name="cor_veiculo"
                    value={formData.cor_veiculo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Preto, Branco, Prata..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chassi *
                  </label>
                  <input
                    type="text"
                    name="chassi_veiculo"
                    value={formData.chassi_veiculo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Número do chassi"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transmissão Automática? *
                  </label>
                  <select
                    name="transmissao_automatica"
                    value={formData.transmissao_automatica}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="nao">Não (Manual)</option>
                    <option value="sim">Sim (Automático)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tem Acessórios?
                  </label>
                  <select
                    name="acessorios_veiculo"
                    value={formData.acessorios_veiculo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sem acessórios</option>
                    <option value="defletor">Defletor</option>
                    <option value="inter_clima">Inter Clima</option>
                    <option value="aerofólio">Aerofólio</option>
                    <option value="defletor_inter_clima">Defletor + Inter Clima</option>
                    <option value="defletor_aerofolio">Defletor + Aerofólio</option>
                    <option value="inter_clima_aerofolio">Inter Clima + Aerofólio</option>
                    <option value="todos">Todos (Defletor + Inter Clima + Aerofólio)</option>
                  </select>
                </div>
              </div>

              {/* Upload do CRLV */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CRLV (Documento do Veículo)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleCRLVChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {anexoCRLV && (
                  <div className="mt-3 flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <span className="text-sm text-gray-700">{anexoCRLV.name}</span>
                    <button
                      type="button"
                      onClick={removeCRLV}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Campos específicos para Rebocador/Truck */}
            {formData.tipo_veiculo === 'rebocador_truck' && (
              <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Rebocador/Truck</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cavalo Mecânico ou Inteiro? *
                    </label>
                    <select
                      name="tipo_cavalo_mecanico"
                      value={formData.tipo_cavalo_mecanico}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Selecione...</option>
                      <option value="cavalo_mecanico">Cavalo Mecânico</option>
                      <option value="inteiro">Inteiro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantidade de Eixos *
                    </label>
                    <input
                      type="number"
                      name="quantidade_eixos"
                      value={formData.quantidade_eixos}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 2, 3, 4..."
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comprimento (metros) *
                    </label>
                    <input
                      type="text"
                      name="comprimento"
                      value={formData.comprimento}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 12,5"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Altura (metros) *
                    </label>
                    <input
                      type="text"
                      name="altura"
                      value={formData.altura}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 3,5"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Teto *
                    </label>
                    <select
                      name="tipo_teto"
                      value={formData.tipo_teto}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Selecione...</option>
                      <option value="alto">Teto Alto</option>
                      <option value="baixo">Teto Baixo</option>
                    </select>
                  </div>

                  {formData.tipo_cavalo_mecanico === 'cavalo_mecanico' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Desatrelado? *
                      </label>
                      <select
                        name="desatrelado"
                        value={formData.desatrelado}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="nao">Não</option>
                        <option value="sim">Sim</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Anexos de fotos do rebocador */}
                <div className="mt-4 pt-4 border-t border-blue-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fotos do Veículo Rebocador/Truck *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleRebocadorFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {anexosRebocador.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {anexosRebocador.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeAnexoRebocador(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Endereços */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Endereços</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço de Origem (Local do Veículo) *
                  </label>
                  <input
                    type="text"
                    name="endereco_origem"
                    value={formData.endereco_origem}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Rua, número, bairro, cidade"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço de Destino *
                  </label>
                  <input
                    type="text"
                    name="endereco_destino"
                    value={formData.endereco_destino}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Rua, número, bairro, cidade"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ponto de Referência
                  </label>
                  <input
                    type="text"
                    name="ponto_referencia"
                    value={formData.ponto_referencia}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Próximo ao posto de gasolina..."
                  />
                </div>
              </div>
            </div>

            {/* Informações Complementares */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Complementares</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.tipo_veiculo === 'passeio' && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Continha crianças menores de 12 anos no veículo? *
                      </label>
                      <select
                        name="criancas_menores_12"
                        value={formData.criancas_menores_12}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Selecione...</option>
                        <option value="sim">Sim</option>
                        <option value="nao">Não</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Continha idosos acima de 65 anos no veículo? *
                      </label>
                      <select
                        name="idosos_acima_65"
                        value={formData.idosos_acima_65}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Selecione...</option>
                        <option value="sim">Sim</option>
                        <option value="nao">Não</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pane ou Sinistro? *
                  </label>
                  <select
                    name="tipo_ocorrencia"
                    value={formData.tipo_ocorrencia}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="pane">Pane</option>
                    <option value="sinistro">Sinistro</option>
                  </select>
                </div>

                {formData.tipo_ocorrencia === 'pane' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qual pane? (Tipo de problema mecânico) *
                    </label>
                    <input
                      type="text"
                      name="tipo_pane"
                      value={formData.tipo_pane}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Descreva o tipo de problema mecânico"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Veículo está vazio? *
                  </label>
                  <select
                    name="veiculo_vazio"
                    value={formData.veiculo_vazio}
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
                    Rodas e pneus livres? *
                  </label>
                  <select
                    name="rodas_pneus_livres"
                    value={formData.rodas_pneus_livres}
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
                    Oficina atende 24hs? *
                  </label>
                  <select
                    name="oficina_24h"
                    value={formData.oficina_24h}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Finais de semana Sura envia para a Base. Necessita de táxi? *
                  </label>
                  <select
                    name="necessita_taxi"
                    value={formData.necessita_taxi}
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

            {/* Descrição */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Descrição do Atendimento</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações e Detalhes *
                </label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descreva a situação do veículo e outros detalhes importantes..."
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
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAnexo(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Atribuição de Técnico */}
            {user?.perfil === 'administrador' && (
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Atribuição de Técnico</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Técnico Responsável
                  </label>
                  <select
                    name="tecnico_responsavel_id"
                    value={formData.tecnico_responsavel_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Não atribuído</option>
                    {usuarios.map((usuario) => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Botões */}
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
                disabled={loading || anexos.length === 0}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Abrindo Chamado...' : 'Abrir Chamado'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default NovoChamadoGuinchoReboque;
