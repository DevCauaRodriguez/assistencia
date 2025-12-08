import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import chamadoRoutes from './routes/chamadoRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import categoriaRoutes from './routes/categoriaRoutes';
import empresaRoutes from './routes/empresaRoutes';
import prestadorRoutes from './routes/prestadorRoutes';
import etapaGuinchoRoutes from './routes/etapaGuinchoRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import anexoRoutes from './routes/anexoRoutes';
import clienteRoutes from './routes/clienteRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/chamados', chamadoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/prestadores', prestadorRoutes);
app.use('/api/etapas-guincho', etapaGuinchoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api', anexoRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API está funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
