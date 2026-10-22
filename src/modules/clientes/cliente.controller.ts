import { type Request, type Response } from 'express';
import { sendSuccess } from '../../core/utils/responseHandler.ts';
import * as service from './cliente.service.ts';

export const crear = async (req: Request, res: Response) => {
    const cliente = await service.crearCliente(req.body);
    sendSuccess(res, cliente, 201, 'Cliente creado. La invitación queda pendiente de envío');
};
