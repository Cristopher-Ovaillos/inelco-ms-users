import { db } from '../../config/database.ts';
import { type CrearClienteDto } from './cliente.schema.ts';


export interface UsuarioRow {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    telefono: string | null;
    activo: boolean;
}

export interface ClienteRow {
    razon_social: string;
    cuit: string;
    direccion_fiscal: string | null;
    plan_servicio: string;
}

// en este endpoint se involucra tres insercciones
/**
 * 1- para inserccion para el usuario que representa la superclase
 * 2- una vez definido el usuario, podemos definir la subclase.
 * 3. generamos un token de invitacion
 */
// debemos evitar que si una falla no genere inconsistencia ni datos redundantes o huerfanos, es por eso que debemos hacer uso de una transaccion

//parametros de la funcion, dto validado con ayuda de zod, texto de token de invitacion, y la expiracion 
// tx es propio de la depednencia de postgres, singifica transaccion, (t)seria la conexion de esa transaccion
export const crearClienteConInvitacion = (dto: CrearClienteDto, token: string, expiracion: Date) =>
    db.tx(async (t) => {
        //.one esperamos una sola fila
        const usuario = await t.one<UsuarioRow>(
            `INSERT INTO usuarios (email, nombre, apellido, telefono, tipo_usuario)
             VALUES ($1, $2, $3, $4, 'cliente')
             RETURNING id, email, nombre, apellido, telefono, activo`,
            [dto.usuario.email, dto.usuario.nombre, dto.usuario.apellido, dto.usuario.telefono ?? null]
        );

        const cliente = await t.one<ClienteRow>(
            `INSERT INTO clientes (usuario_id, razon_social, cuit, direccion_fiscal, plan_servicio)
             VALUES ($1, $2, $3, $4, COALESCE($5, 'Estandar'))
             RETURNING razon_social, cuit, direccion_fiscal, plan_servicio`,
            [usuario.id, dto.cliente.razon_social, dto.cliente.cuit,
            dto.cliente.direccion_fiscal ?? null, dto.cliente.plan_servicio ?? null]
        );

        await t.none(
            `INSERT INTO tokens_invitacion (usuario_id, token, fecha_expiracion) VALUES ($1, $2, $3)`,
            [usuario.id, token, expiracion]
        );

        return { usuario, cliente };
    });


