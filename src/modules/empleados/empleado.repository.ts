import { db } from '../../config/database.ts';
import { type CrearEmpleadoDto } from './empleado.schema.ts';

// "row" = una fila tal como la devuelve la base, con los nombres de las columnas.
// sirve para que TypeScript conozca la forma de cada resultado.
export interface UsuarioRow {
    id: string;
    email: string;
    nombre_completo: string;
    telefono: string | null; // null porque la columna acepta NULL
    activo: boolean;
}

export interface EmpleadoRow {
    id: string;
    estado_empleo: string;
    fecha_ingreso: string;
}

export interface PermisoRow {
    id: number;
    codigo: string;
}

export interface EspecialidadRow {
    id: number;
    nombre: string;
}

// db.tx abre una transaccion: usuario, empleado e invitacion se guardan juntos (COMMIT)
// o, si algo falla, no se guarda nada (ROLLBACK). Es la atomicidad (la A de ACID) del Ejercicio 11.
// "t" es la conexion de esa transaccion: hay que usar t y no db adentro.
export const crearEmpleadoConInvitacion = (dto: CrearEmpleadoDto, token: string, expiracion: Date) =>
    db.tx(async (t) => {
        // t.one espera exactamente una fila. RETURNING devuelve lo insertado sin hacer otro SELECT.
        // la cuenta nace con activo en false y sin password: se completan al usar el token.
        const usuario = await t.one<UsuarioRow>(
            `INSERT INTO usuarios (email, nombre_completo, telefono)
             VALUES ($1, $2, $3)
             RETURNING id, email, nombre_completo, telefono, activo`,
            [dto.usuario.email, dto.usuario.nombre_completo, dto.usuario.telefono ?? null]
            // ?? null: si el campo opcional no vino, se guarda NULL
        );

        // empleado es una especializacion de usuario (ISA del MER): se enlaza por usuario_id.
        // to_char devuelve la fecha como texto 'YYYY-MM-DD'. Sin eso, pg la convierte en un Date de
        // JavaScript y por la zona horaria puede mostrar el dia anterior.
        const empleado = await t.one<EmpleadoRow>(
            `INSERT INTO empleados (usuario_id, estado_empleo, fecha_ingreso)
             VALUES ($1, $2, $3)
             RETURNING id, estado_empleo, to_char(fecha_ingreso, 'YYYY-MM-DD') AS fecha_ingreso`,
            [usuario.id, dto.empleado.estado, dto.empleado.fecha_ingreso]
        );

        await t.none(
            'INSERT INTO tokens_invitacion (usuario_id, token, fecha_expiracion) VALUES ($1, $2, $3)',
            [usuario.id, token, expiracion]
        );

        return { usuario, empleado };
    });

// oneOrNone: devuelve la fila o null si no existe
export const existeEmpleado = (empleadoId: string) =>
    db.oneOrNone<{ id: string }>('SELECT id FROM empleados WHERE id = $1', [empleadoId]);

// $1:csv de pg-promise convierte el array en 'a','b','c' para el IN (...).
// los valores van como parametros, no pegados en el texto: asi se evita la inyeccion SQL
export const buscarPermisosPorCodigo = (codigos: string[]) =>
    db.any<PermisoRow>('SELECT id, codigo FROM permisos WHERE codigo IN ($1:csv)', [codigos]);

// "asignar la coleccion" = dejar al empleado exactamente con estos permisos.
// borrar los anteriores e insertar los nuevos va en una transaccion: si falla un insert,
// el empleado no se queda sin permisos
export const reemplazarPermisos = (empleadoId: string, permisoIds: number[]) =>
    db.tx(async (t) => {
        await t.none('DELETE FROM empleado_permisos WHERE empleado_id = $1', [empleadoId]);
        for (const permisoId of permisoIds) {
            await t.none(
                'INSERT INTO empleado_permisos (empleado_id, permiso_id) VALUES ($1, $2)',
                [empleadoId, permisoId]
            );
        }
    });

export const buscarEspecialidadPorId = (especialidadId: number) =>
    db.oneOrNone<EspecialidadRow>('SELECT id, nombre FROM especialidades WHERE id = $1', [especialidadId]);

// t.none / db.none: no se espera ninguna fila de vuelta
export const asignarEspecialidad = (empleadoId: string, especialidadId: number) =>
    db.none(
        'INSERT INTO empleado_especialidades (empleado_id, especialidad_id) VALUES ($1, $2)',
        [empleadoId, especialidadId]
    );
