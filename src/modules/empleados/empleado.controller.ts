import { type Request, type Response } from 'express';
import { sendSuccess } from '../../core/utils/responseHandler.ts';
import * as service from './empleado.service.ts';

// el controller solo traduce HTTP: toma los datos del pedido, llama al service y responde.
// req.body y req.params ya llegan validados, porque pasaron antes por validateRequest.
// sendSuccess da el formato de respuesta comun { success, message, data }.
// 201 = Created (se creo algo nuevo), 200 = OK
export const crear = async (req: Request, res: Response) => {
    const empleado = await service.crearEmpleado(req.body);
    sendSuccess(res, empleado, 201, 'Empleado creado. La invitación queda pendiente de envío');
};

export const asignarPermisos = async (req: Request, res: Response) => {
    const resultado = await service.asignarPermisos(req.params.empleado_id as string, req.body.permisos);
    sendSuccess(res, resultado, 200, 'Permisos asignados');
};

export const asignarEspecialidad = async (req: Request, res: Response) => {
    const resultado = await service.asignarEspecialidad(req.params.empleado_id as string, req.body);
    sendSuccess(res, resultado, 201, 'Especialidad asignada');
};
