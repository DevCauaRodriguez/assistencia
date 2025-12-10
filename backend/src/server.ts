import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/database';
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

// Configurar CORS para aceitar requisições do frontend
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middlewares
app.use(cors(corsOptions));
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

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  
  // Testar conexão com banco de dados
  try {
    const connection = await db.getConnection();
    console.log('✅ Conexão com banco de dados estabelecida');
    connection.release();
  } catch (error: any) {
    console.error('❌ Erro ao conectar ao banco de dados:');
    console.error(`   Host: ${process.env.DB_HOST}`);
    console.error(`   Database: ${process.env.DB_NAME}`);
    console.error(`   Erro: ${error.message}`);
    console.error('\n⚠️  Certifique-se de que:');
    console.error('   1. MySQL está rodando (Laragon)');
    console.error('   2. Database "assistencia_auto" foi criada');
    console.error('   3. As variáveis de ambiente estão corretas');
  }
});

export default app;
