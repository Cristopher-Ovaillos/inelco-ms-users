import {Router} from 'express';
import pingRoutes from './modules/ping/ping.routes.ts';
import clienteRoutes from './modules/clientes/cliente.routes.ts';
import empleadoRoutes from './modules/empleados/empleado.routes.ts';

const router = Router();

// registrar los modulos aca, swagger documenta lo que se monte en este archivo
router.use('/ping', pingRoutes);
router.use('/clientes', clienteRoutes);
router.use('/empleados', empleadoRoutes); // queda en /api/empleados porque API_PREFIX es /api

export default router;
