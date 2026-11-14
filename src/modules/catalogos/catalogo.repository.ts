import { db } from "../../config/database.ts";


export interface PermisosRow{
    id: number;
    codigo: string;
    descripcion:string|null;
}

export interface EspecialidadRow{
    id:number;
    nombre:string;
    descripcion:string|null;
}

export const listarPermisos= () =>{
    return db.any<PermisosRow>(
        'SELECT id, codigo, descripcion FROM permisos ORDER BY codigo'
    );
}

export const listarEspecialidades = () =>{
    return db.any<EspecialidadRow>(
        'SELECT id, nombre,descripcion FROM especialidades ORDER BY nombre'
    )
}







