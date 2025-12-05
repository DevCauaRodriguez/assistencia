import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chamados from './pages/Chamados';
import ChamadoDetalhes from './pages/ChamadoDetalhes';
import NovoChamadoWizard from './pages/NovoChamadoWizard';
import SelecaoTipoVeiculo from './pages/SelecaoTipoVeiculo';
import NovoChamadoPadrao from './pages/NovoChamadoPadrao';
import NovoChamadoGuinchoReboque from './pages/NovoChamadoGuinchoReboque';
import Usuarios from './pages/Usuarios';
import Empresas from './pages/Empresas';
import Prestadores from './pages/Prestadores';
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
          <Route path="/usuarios" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
          <Route path="/empresas" element={<PrivateRoute><Empresas /></PrivateRoute>} />
          <Route path="/prestadores" element={<PrivateRoute><Prestadores /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
