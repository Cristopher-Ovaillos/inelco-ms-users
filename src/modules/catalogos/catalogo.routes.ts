import { Router } from "express";
import { asyncHandler } from "../../core/utils/asyncHandler.ts";
import { permisos, especialidades } from './catalogo.controller.ts';


export const permisoRoutes = Router();
export const especialidadRoutes = Router();


permisoRoutes.get('/', asyncHandler(async (req, res) => {
    // #swagger.tags = ['Catálogos']
    // #swagger.summary = 'Lista los permisos que se pueden asignar a un empleado'
    // #swagger.responses[200] = { description: 'Lista de permisos' }
    return permisos(req, res);
}));

especialidadRoutes.get('/', asyncHandler(async (req, res) => {
    // #swagger.tags = ['Catálogos']
    // #swagger.summary = 'Lista las especialidades de los técnicos'
    // #swagger.responses[200] = { description: 'Lista de especialidades' }
    return especialidades(req, res);
}));
