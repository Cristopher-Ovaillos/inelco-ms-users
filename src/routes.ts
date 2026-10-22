import {Router} from 'express';
import pingRoutes from './modules/ping/ping.routes.ts';
import clienteRoutes from './modules/clientes/cliente.routes.ts';

const router = Router();

// registrar los modulos aca, swagger documenta lo que se monte en este archivo
router.use('/ping', pingRoutes);
router.use('/clientes', clienteRoutes);

export default router;
