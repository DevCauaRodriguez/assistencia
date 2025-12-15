import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chamados from './pages/Chamados';
import ChamadoDetalhes from './pages/ChamadoDetalhes';
import NovoChamadoWizard from './pages/NovoChamadoWizard';
import SelecaoTipoVeiculo from './pages/SelecaoTipoVeiculo';
import NovoChamadoPadrao from './pages/chamado/NovoChamadoPadrao';
import NovoChamadoGuinchoReboque from './pages/NovoChamadoGuinchoReboque';
import SelecaoTipoVeiculoParabrisa from './pages/SelecaoTipoVeiculoParabrisa';
import NovoChamadoParabrisa from './pages/NovoChamadoParabrisa';
import Usuarios from './pages/usuarios/Usuarios';
import Empresas from './pages/seguradora/Seguradoras';
import Prestadores from './pages/prestadores/Prestadores';
import Solicitantes from './pages/solicitantes/Solicitantes';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/chamados" element={<PrivateRoute><Chamados /></PrivateRoute>} />
          <Route path="/chamados/:id" element={<PrivateRoute><ChamadoDetalhes /></PrivateRoute>} />
          <Route path="/novo-chamado" element={<PrivateRoute><NovoChamadoWizard /></PrivateRoute>} />
          <Route path="/novo-chamado/selecao-tipo-veiculo" element={<PrivateRoute><SelecaoTipoVeiculo /></PrivateRoute>} />
          <Route path="/novo-chamado/guincho-reboque" element={<PrivateRoute><NovoChamadoGuinchoReboque /></PrivateRoute>} />
          <Route path="/novo-chamado/padrao" element={<PrivateRoute><NovoChamadoPadrao /></PrivateRoute>} />
          <Route path="/novo-chamado/selecao-tipo-veiculo-parabrisa" element={<PrivateRoute><SelecaoTipoVeiculoParabrisa /></PrivateRoute>} />
          <Route path="/novo-chamado/parabrisa" element={<PrivateRoute><NovoChamadoParabrisa /></PrivateRoute>} />
          <Route path="/usuarios" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
          <Route path="/solicitantes" element={<PrivateRoute><Solicitantes /></PrivateRoute>} />
          <Route path="/seguradoras" element={<PrivateRoute><Empresas /></PrivateRoute>} />
          <Route path="/prestadores" element={<PrivateRoute><Prestadores /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
