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
                    nombre_completo: { type: 'string', example: 'Laura Gómez' },
                    telefono: { type: 'string', example: '+54 9 11 5555-1234' } } },
                cliente: { type: 'object', properties: {
                    razon_social: { type: 'string', example: 'Acme S.A.' },
                    direccion: { type: 'string', example: 'Av. Siempreviva 742' },
                    contacto_adicional: { type: 'string', example: 'Mesa de compras' },
                    info_comercial: { type: 'string', example: 'Contrato de mantenimiento anual' } } }
            }
        } } }
    } */
    // #swagger.responses[201] = { description: 'Cliente creado' }
    // #swagger.responses[400] = { description: 'Datos inválidos' }
    // #swagger.responses[409] = { description: 'El email ya está registrado' }
    return crear(req, res);
}));

export default router;
