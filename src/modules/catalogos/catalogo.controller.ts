import { type Request, type Response } from "express";
import { sendSuccess } from "../../core/utils/responseHandler.ts";


import * as service from './catalogo.service.ts';
//los services siempre asincronos

export const permisos = async (_req:Request,res:Response) =>{
    sendSuccess(res, await service.listarPermisos());
}

export const especialidades = async (_req:Request,res:Response) =>{
    sendSuccess(res, await service.listarEspecialidades());
}


