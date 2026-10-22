import { randomBytes } from 'node:crypto';
import { AppError } from '../../core/errors/AppError.ts';
import { type CrearEmpleadoDto, type AsignarEspecialidadDto } from './empleado.schema.ts';
import * as repository from './empleado.repository.ts';
import { toEmpleadoDto } from './empleado.mapper.ts';

const DIAS_VALIDEZ_INVITACION = 7;

// el service decide que se hace y en que orden. No sabe de HTTP (req/res) ni de SQL:
// eso lo mantiene facil de leer y de probar.

export const crearEmpleado = async (dto: CrearEmpleadoDto) => {
    // token de un solo uso, aleatorio y dificil de adivinar (32 bytes pasados a hexadecimal)
    const token = randomBytes(32).toString('hex');
    const expiracion = new Date(Date.now() + DIAS_VALIDEZ_INVITACION * 24 * 60 * 60 * 1000); // en ms

    try {
        const { usuario, empleado } = await repository.crearEmpleadoConInvitacion(dto, token, expiracion);
        return toEmpleadoDto(usuario, empleado, token, expiracion); // el mapper prepara la respuesta
    } catch (error) {
        // 23505 = violacion de UNIQUE en postgres (email repetido). Se traduce a 409 Conflict.
        // cualquier otro error se relanza y termina en 500. Para entonces la transaccion
        // ya hizo ROLLBACK: no queda nada a medias
        if ((error as { code?: string }).code === '23505') {
            throw new AppError('Ya existe un usuario con ese email', 409, true);
        }
        throw error;
    }
};

export const asignarPermisos = async (empleadoId: string, codigosPedidos: string[]) => {
    // regla: el empleado tiene que existir (404 = recurso de la URL no encontrado)
    if (!(await repository.existeEmpleado(empleadoId))) {
        throw new AppError('Empleado no encontrado', 404, true);
    }

    // Set quita repetidos: 'VER_CONSULTAS' dos veces violaria la clave primaria compuesta
    const codigos = [...new Set(codigosPedidos)];

    // regla: solo se asignan permisos que existan en el catalogo
    const existentes = await repository.buscarPermisosPorCodigo(codigos);
    const encontrados = existentes.map((p) => p.codigo);
    const faltantes = codigos.filter((c) => !encontrados.includes(c));
    if (faltantes.length > 0) {
        // AppError(mensaje, codigo http, esOperacional, detalle por campo).
        // true = error esperado: el errorHandler lo responde sin tratarlo como falla del servidor
        throw new AppError('Error de validación', 400, true, {
            permisos: faltantes.map((c) => `No existe el permiso ${c}`),
        });
    }

    await repository.reemplazarPermisos(empleadoId, existentes.map((p) => p.id));
    return { empleado_id: empleadoId, permisos: codigos };
};

export const asignarEspecialidad = async (empleadoId: string, dto: AsignarEspecialidadDto) => {
    if (!(await repository.existeEmpleado(empleadoId))) {
        throw new AppError('Empleado no encontrado', 404, true);
    }

    // la especialidad viene en el body y no en la URL, por eso si no existe es 400 y no 404
    const especialidad = await repository.buscarEspecialidadPorId(dto.especialidad_id);
    if (!especialidad) {
        throw new AppError('Error de validación', 400, true, {
            especialidad_id: [`No existe la especialidad ${dto.especialidad_id}`],
        });
    }

    try {
        await repository.asignarEspecialidad(empleadoId, dto.especialidad_id);
    } catch (error) {
        // la clave primaria compuesta (empleado, especialidad) impide repetir la pareja
        if ((error as { code?: string }).code === '23505') {
            throw new AppError('El empleado ya tiene esa especialidad', 409, true);
        }
        throw error;
    }

    return { empleado_id: empleadoId, especialidad };
};
