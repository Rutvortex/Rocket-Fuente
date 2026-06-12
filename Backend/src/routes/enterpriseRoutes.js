import express from 'express';
import {
  createEnterprise,
  getEnterprise,
  updateEnterprise,
  addMember,
  createBot,
  getEnterpriseBots,
  upgradePlan,
  getEnterpriseStats
} from '../Controllers/enterpriseController.js';
import authenticate from '../Middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas de empresas requieren autenticación
router.use(authenticate);

// CRUD de empresas
router.post('/', createEnterprise);
router.get('/:enterpriseId', getEnterprise);
router.put('/:enterpriseId', updateEnterprise);
router.get('/:enterpriseId/stats', getEnterpriseStats);

// Gestión de miembros
router.post('/:enterpriseId/members', addMember);

// Gestión de bots
router.post('/:enterpriseId/bots', createBot);
router.get('/:enterpriseId/bots', getEnterpriseBots);

// Planes y suscripción
router.put('/:enterpriseId/upgrade-plan', upgradePlan);

export default router;
