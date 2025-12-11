import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArrowLeft, ArrowRight, Car, Truck } from 'lucide-react';

const SelecaoTipoVeiculoParabrisa = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const categoria_id = location.state?.categoria_id;
  const [tipoSelecionado, setTipoSelecionado] = useState('');

  const handleNext = () => {
    if (!tipoSelecionado) {
      alert('Por favor, selecione o tipo de veículo');
      return;
    }

    navigate('/novo-chamado/parabrisa', { 
      state: { 
        categoria_id,
        tipo_veiculo: tipoSelecionado
      } 
    });
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
            <h1 className="text-2xl font-bold mb-2">Para-brisa</h1>
            <p className="text-blue-100">Etapa 1 de 2 — Tipo de Veículo</p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Selecione o Tipo de Veículo
              </h2>
              <p className="text-sm text-gray-600">
                Escolha se a assistência é para veículo de passeio ou rebocador/truck
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Veículo de Passeio */}
              <button
                type="button"
                onClick={() => setTipoSelecionado('passeio')}
                className={`p-8 border-2 rounded-xl transition-all duration-200 text-left ${
                  tipoSelecionado === 'passeio'
                    ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-4 rounded-full mb-4 ${
                    tipoSelecionado === 'passeio' 
                      ? 'bg-blue-100' 
                      : 'bg-gray-100'
                  }`}>
                    <Car size={48} className={
                      tipoSelecionado === 'passeio' 
                        ? 'text-blue-600' 
                        : 'text-gray-600'
                    } />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Veículo de Passeio
                  </h3>
                  <p className="text-sm text-gray-600">
                    Carros, motocicletas e veículos leves
                  </p>
                </div>
              </button>

              {/* Rebocador/Truck */}
              <button
                type="button"
                onClick={() => setTipoSelecionado('rebocador_truck')}
                className={`p-8 border-2 rounded-xl transition-all duration-200 text-left ${
                  tipoSelecionado === 'rebocador_truck'
                    ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-4 rounded-full mb-4 ${
                    tipoSelecionado === 'rebocador_truck' 
                      ? 'bg-blue-100' 
                      : 'bg-gray-100'
                  }`}>
                    <Truck size={48} className={
                      tipoSelecionado === 'rebocador_truck' 
                        ? 'text-blue-600' 
                        : 'text-gray-600'
                    } />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Rebocador/Truck
                  </h3>
                  <p className="text-sm text-gray-600">
                    Caminhões, carretas e veículos pesados
                  </p>
                </div>
              </button>
            </div>

            {/* Botões de Navegação */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
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
                disabled={!tipoSelecionado}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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

export default SelecaoTipoVeiculoParabrisa;
