import { Router } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler.ts';
import { validateRequest } from '../../core/middlewares/validateRequest.ts';
import {
    crearEmpleadoSchema,
    asignarPermisosSchema,
    asignarEspecialidadSchema,
} from './empleado.schema.ts';
import { crear, asignarPermisos, asignarEspecialidad } from './empleado.controller.ts';

const router = Router();

// el orden importa: primero validateRequest (si falla corta con 400) y despues el controller.
// asyncHandler envuelve el handler async: si algo lanza un error lo manda al errorHandler,
// asi no hace falta un try/catch en cada controller.
// los comentarios #swagger los lee swagger-autogen al correr `npm run swagger` (inciso d de la
// consigna) y tienen que ir dentro del handler: en el controller no los lee.

router.post('/', validateRequest(crearEmpleadoSchema), asyncHandler(async (req, res) => {
    // #swagger.tags = ['Empleados']
    // #swagger.summary = 'Registra un empleado con su estado de empleo y su token de invitación'
    /* #swagger.requestBody = {
        required: true,
        content: { 'application/json': { schema: {
            type: 'object',
            properties: {
                usuario: { type: 'object', properties: {
                    email: { type: 'string', example: 'tecnico1@inelco.com' },
                    nombre_completo: { type: 'string', example: 'Martín Pérez' },
                    telefono: { type: 'string', example: '+54 9 11 5555-0000' } } },
                empleado: { type: 'object', properties: {
                    estado: { type: 'string', enum: ['activo', 'licencia', 'baja'], example: 'activo' },
                    fecha_ingreso: { type: 'string', example: '2026-03-01' } } }
            }
        } } }
    } */
    // #swagger.responses[201] = { description: 'Empleado creado' }
    // #swagger.responses[400] = { description: 'Datos inválidos' }
    // #swagger.responses[409] = { description: 'El email ya está registrado' }
    return crear(req, res);
}));

router.post('/:empleado_id/permisos', validateRequest(asignarPermisosSchema), asyncHandler(async (req, res) => {
    // #swagger.tags = ['Empleados']
    // #swagger.summary = 'Asigna la colección de permisos directos a un empleado (reemplaza los anteriores)'
    // #swagger.parameters['empleado_id'] = { description: 'UUID del empleado' }
    /* #swagger.requestBody = {
        required: true,
        content: { 'application/json': { schema: {
            type: 'object',
            properties: {
                permisos: { type: 'array', items: { type: 'string' },
                    example: ['VER_CONSULTAS', 'RESPONDER_CHAT', 'APROBAR_SOLUCION'] }
            }
        } } }
    } */
    // #swagger.responses[200] = { description: 'Permisos asignados' }
    // #swagger.responses[400] = { description: 'Permiso inexistente o datos inválidos' }
    // #swagger.responses[404] = { description: 'Empleado no encontrado' }
    return asignarPermisos(req, res);
}));

router.post('/:empleado_id/especialidades', validateRequest(asignarEspecialidadSchema), asyncHandler(async (req, res) => {
    // #swagger.tags = ['Empleados']
    // #swagger.summary = 'Agrega una especialidad al empleado (se usa para distribuir las consultas)'
    // #swagger.parameters['empleado_id'] = { description: 'UUID del empleado' }
    /* #swagger.requestBody = {
        required: true,
        content: { 'application/json': { schema: {
            type: 'object',
            properties: { especialidad_id: { type: 'number', example: 1 } }
        } } }
    } */
    // #swagger.responses[201] = { description: 'Especialidad asignada' }
    // #swagger.responses[400] = { description: 'La especialidad no existe o datos inválidos' }
    // #swagger.responses[404] = { description: 'Empleado no encontrado' }
    // #swagger.responses[409] = { description: 'El empleado ya tiene esa especialidad' }
    return asignarEspecialidad(req, res);
}));

export default router;
