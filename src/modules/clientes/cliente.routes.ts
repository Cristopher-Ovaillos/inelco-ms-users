import { Router } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler.ts';
import { validateRequest } from '../../core/middlewares/validateRequest.ts';
import { crearClienteSchema } from './cliente.schema.ts';
import { crear } from './cliente.controller.ts';

const router = Router();

router.post('/', validateRequest(crearClienteSchema), asyncHandler(async (req, res) => {
    // #swagger.tags = ['Clientes']
    // #swagger.summary = 'Crea un cliente con su usuario y su token de invitación'
    /* #swagger.requestBody = {
        required: true,
        content: { 'application/json': { schema: {
            type: 'object',
            properties: {
                usuario: { type: 'object', properties: {
                    email: { type: 'string', example: 'compras@acme.com' },
                    nombre: { type: 'string', example: 'Laura' },
                    apellido: { type: 'string', example: 'Gómez' },
                    telefono: { type: 'string', example: '+54 9 11 5555-1234' } } },
                cliente: { type: 'object', properties: {
                    razon_social: { type: 'string', example: 'Acme S.A.' },
                    cuit: { type: 'string', example: '30-12345678-9' },
                    direccion_fiscal: { type: 'string', example: 'Av. Siempreviva 742' },
                    plan_servicio: { type: 'string', example: 'Estandar' } } }
            }
        } } }
    } */
    // #swagger.responses[201] = { description: 'Cliente creado' }
    // #swagger.responses[400] = { description: 'Datos inválidos' }
    // #swagger.responses[409] = { description: 'Email o CUIT ya registrados' }
    return crear(req, res);
}));

export default router;
