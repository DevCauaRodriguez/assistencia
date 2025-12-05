import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../lib/api';
import { Plus, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  especializacao: string;
  ativo: boolean;
}

const Usuarios = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    perfil: 'tecnico',
    especializacao: ''
  });

  useEffect(() => {
    if (user?.perfil !== 'administrador') {
      alert('Acesso negado');
      return;
    }
    loadUsuarios();
  }, [user]);

  const loadUsuarios = async () => {
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/usuarios/${editingUser.id}`, formData);
      } else {
        await api.post('/usuarios', formData);
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ nome: '', email: '', senha: '', perfil: 'tecnico', especializacao: '' });
      loadUsuarios();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro ao salvar usuário');
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      senha: '',
      perfil: usuario.perfil,
      especializacao: usuario.especializacao || ''
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const acao = currentStatus ? 'inativar' : 'ativar';
    if (!confirm(`Deseja realmente ${acao} este usuário?`)) return;

    try {
      await api.patch(`/usuarios/${id}/toggle-status`);
      loadUsuarios();
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      alert('Erro ao alterar status do usuário');
    }
  };

  if (user?.perfil !== 'administrador') {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Acesso negado</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <button
            onClick={() => {
              setEditingUser(null);
              setFormData({ nome: '', email: '', senha: '', perfil: 'tecnico', especializacao: '' });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo Usuário
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perfil</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Especialização</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{usuario.nome}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{usuario.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      usuario.perfil === 'administrador' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {usuario.perfil}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{usuario.especializacao || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      usuario.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(usuario)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(usuario.id, usuario.ativo)}
                        className={`p-1 rounded ${
                          usuario.ativo 
                            ? 'text-red-600 hover:bg-red-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={usuario.ativo ? 'Inativar' : 'Ativar'}
                      >
                        {usuario.ativo ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Senha</label>
                    <input
                      type="password"
                      value={formData.senha}
                      onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Perfil</label>
                  <select
                    value={formData.perfil}
                    onChange={(e) => setFormData({ ...formData, perfil: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="tecnico">Técnico</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Especialização</label>
                  <input
                    type="text"
                    value={formData.especializacao}
                    onChange={(e) => setFormData({ ...formData, especializacao: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
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

export default Usuarios;
