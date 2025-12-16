import { useState } from 'react';
import { Car, Truck } from 'lucide-react';

interface TipoVeiculoSelectorProps {
  onSelect: (tipo: string) => void;
  tipoSelecionado?: string;
  titulo?: string;
  descricao?: string;
  labelPasseio?: string;
  labelTruck?: string;
}

const TipoVeiculoSelector = ({
  onSelect,
  tipoSelecionado = '',
  titulo = 'Selecione o Tipo de Veículo',
  descricao = 'Escolha se a assistência é para veículo de passeio ou rebocador/truck',
  labelPasseio = 'Veículo de Passeio',
  labelTruck = 'Rebocador/Truck',
}: TipoVeiculoSelectorProps) => {
  const [selecionado, setSelecionado] = useState(tipoSelecionado);

  const handleSelect = (tipo: string) => {
    setSelecionado(tipo);
    onSelect(tipo);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{titulo}</h2>
        <p className="text-sm text-gray-600">{descricao}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Veículo de Passeio */}
        <button
          type="button"
          onClick={() => handleSelect('passeio')}
          className={`p-8 border-2 rounded-xl transition-all duration-200 text-left ${
            selecionado === 'passeio'
              ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`p-4 rounded-full mb-4 ${
              selecionado === 'passeio' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Car size={48} className={
                selecionado === 'passeio' ? 'text-blue-600' : 'text-gray-600'
              } />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{labelPasseio}</h3>
            <p className="text-sm text-gray-600">Carros, motocicletas e veículos leves</p>
          </div>
        </button>
        {/* Rebocador/Truck */}
        <button
          type="button"
          onClick={() => handleSelect('rebocador_truck')}
          className={`p-8 border-2 rounded-xl transition-all duration-200 text-left ${
            selecionado === 'rebocador_truck'
              ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`p-4 rounded-full mb-4 ${
              selecionado === 'rebocador_truck' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Truck size={48} className={
                selecionado === 'rebocador_truck' ? 'text-blue-600' : 'text-gray-600'
              } />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{labelTruck}</h3>
            <p className="text-sm text-gray-600">Caminhões, carretas e veículos pesados</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default TipoVeiculoSelector;
