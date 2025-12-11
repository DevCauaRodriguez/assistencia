import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../lib/api';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Categoria {
  id: number;
  nome: string;
}

const NovoChamadoWizard = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    if (!categoriaSelecionada) {
      alert('Por favor, selecione uma categoria');
      return;
    }

    const categoriaObj = categorias.find(c => c.id.toString() === categoriaSelecionada);
    
    if (categoriaObj?.nome.toLowerCase().includes('guincho') || 
        categoriaObj?.nome.toLowerCase().includes('reboque')) {
      navigate('/novo-chamado/selecao-tipo-veiculo', { 
        state: { categoria_id: parseInt(categoriaSelecionada) } 
      });
    } else if (categoriaObj?.nome.toLowerCase().includes('parabrisa') ||
               categoriaObj?.nome.toLowerCase().includes('para-brisa')) {
      navigate('/novo-chamado/selecao-tipo-veiculo-parabrisa', { 
        state: { categoria_id: parseInt(categoriaSelecionada) } 
      });
    } else {
      navigate('/novo-chamado/padrao', { 
        state: { categoria_id: parseInt(categoriaSelecionada) } 
      });
    }
  };

  const handleBack = () => {
    navigate('/chamados');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <h1 className="text-2xl font-bold mb-2">Novo Chamado de Assistência</h1>
            <p className="text-blue-100">Etapa 1 de 1 — Seleção da Categoria</p>
          </div>

          {/* Content */}
          <div className="p-8">
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
                Voltar
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!categoriaSelecionada}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
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
