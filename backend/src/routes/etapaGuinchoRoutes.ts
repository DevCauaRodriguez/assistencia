import { Router } from 'express';
import { 
  getEtapasGuidoReboque, 
  avancarEtapaGuidoReboque,
  atualizarProtocoloSeguradora,
  atualizarTempoDeslocamento,
  registrarAtualizacaoEtapa3,
  finalizarChamadoAssistencia
} from '../controllers/etapaGuinchoController';

const router = Router();

router.get('/:chamado_id', getEtapasGuidoReboque);
router.post('/:chamado_id/avancar', avancarEtapaGuidoReboque);
router.post('/:chamado_id/protocolo', atualizarProtocoloSeguradora);
router.post('/:chamado_id/tempo-deslocamento', atualizarTempoDeslocamento);
router.post('/:chamado_id/atualizar-etapa3', registrarAtualizacaoEtapa3);
router.post('/:chamado_id/finalizar', finalizarChamadoAssistencia);

export default router;
