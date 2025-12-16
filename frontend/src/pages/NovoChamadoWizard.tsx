import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import TipoVeiculoSelector from '../components/TipoVeiculoSelector';
import api from '../lib/api';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Categoria {
  id: number;
  nome: string;
}

interface CategoriaDestino {
  [key: string]: string;
}

// Mapeamento de categoria para rota de destino
const categoriaDestino: CategoriaDestino = {
  'guincho_reboque': '/novo-chamado/guincho-reboque',
  'parabrisa': '/novo-chamado/parabrisa',
};

const NovoChamadoWizard = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [tipoVeiculoSelecionado, setTipoVeiculoSelecionado] = useState('');
  const [etapa, setEtapa] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [categoriaNome, setCategoriaNome] = useState('');

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      alert('Erro ao carregar categorias. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (etapa === 1) {
      if (!categoriaSelecionada) {
        alert('Por favor, selecione uma categoria');
        return;
      }

      const categoriaObj = categorias.find(c => c.id.toString() === categoriaSelecionada);
      const isGuinchoReboque = categoriaObj?.nome.toLowerCase().includes('guincho') || 
                               categoriaObj?.nome.toLowerCase().includes('reboque');
      const isParabrisa = categoriaObj?.nome.toLowerCase().includes('parabrisa') ||
                          categoriaObj?.nome.toLowerCase().includes('para-brisa');

      if (isGuinchoReboque || isParabrisa) {
        setCategoriaNome(isParabrisa ? 'parabrisa' : 'guincho_reboque');
        setEtapa(2);
      } else {
        navigate('/novo-chamado/padrao', { 
          state: { categoria_id: parseInt(categoriaSelecionada) } 
        });
      }
    } else if (etapa === 2) {
      if (!tipoVeiculoSelecionado) {
        alert('Por favor, selecione o tipo de veículo');
        return;
      }

      const destino = categoriaDestino[categoriaNome] || '/novo-chamado/guincho-reboque';
      navigate(destino, {
        state: {
          categoria_id: parseInt(categoriaSelecionada),
          tipo_veiculo: tipoVeiculoSelecionado
        }
      });
    }
  };

  const handleBack = () => {
    if (etapa === 2) {
      setEtapa(1);
      setTipoVeiculoSelecionado('');
    } else {
      navigate('/chamados');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <h1 className="text-2xl font-bold mb-2">Novo Chamado de Assistência</h1>
            <p className="text-blue-100">Etapa {etapa} de {etapa === 1 ? 1 : 2} — {etapa === 1 ? 'Seleção da Categoria' : 'Tipo de Veículo'}</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {etapa === 1 ? (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Selecione o Tipo de Assistência
                  </h2>
                  <p className="text-sm text-gray-600">
                    Escolha a categoria que melhor representa o tipo de atendimento necessário
                  </p>
                </div>

                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    Carregando categorias...
                  </div>
                ) : categorias.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma categoria disponível
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Categoria do Atendimento *
                    </label>
                    {categorias.map((categoria) => (
                      <label
                        key={categoria.id}
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          categoriaSelecionada === categoria.id.toString()
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="categoria"
                          value={categoria.id}
                          checked={categoriaSelecionada === categoria.id.toString()}
                          onChange={(e) => setCategoriaSelecionada(e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className={`ml-3 text-base font-medium ${
                          categoriaSelecionada === categoria.id.toString()
                            ? 'text-blue-900'
                            : 'text-gray-700'
                        }`}>
                          {categoria.nome}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <TipoVeiculoSelector
                tipoSelecionado={tipoVeiculoSelecionado}
                onSelect={setTipoVeiculoSelecionado}
              />
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200"
              >
                <ArrowLeft size={20} />
                {etapa === 2 ? 'Anterior' : 'Voltar'}
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={etapa === 1 ? !categoriaSelecionada : !tipoVeiculoSelecionado}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {etapa === 2 ? 'Confirmar' : 'Próximo'}
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NovoChamadoWizard;
