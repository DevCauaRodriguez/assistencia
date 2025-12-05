import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  getAnexosChamado,
  uploadAnexo,
  downloadAnexo,
  deleteAnexo
} from '../controllers/anexoController';

const router = express.Router();

// Criar diretório de uploads se não existir
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar imagens, PDFs e documentos
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Apenas imagens, PDFs e documentos são aceitos.'));
    }
  }
});

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Listar anexos de um chamado
router.get('/chamados/:chamado_id/anexos', getAnexosChamado);

// Upload de anexo
router.post('/chamados/:chamado_id/anexos', upload.single('arquivo'), uploadAnexo);

// Download de anexo
router.get('/anexos/:id/download', downloadAnexo);

// Deletar anexo
router.delete('/anexos/:id', deleteAnexo);

export default router;
