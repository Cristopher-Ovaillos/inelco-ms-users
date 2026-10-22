import { randomBytes } from 'node:crypto';
import { AppError } from '../../core/errors/AppError.ts';
import { type CrearClienteDto } from './cliente.schema.ts';
import * as repository from './cliente.repository.ts';
import { toClienteDto } from './cliente.mapper.ts';

//hasta ahora ya validamos los datos recibidos, necestiamos preparar el token y la fechad e vencimiento
/**
 * para esto, se usa randombytes propio de node:crypto
 * 1. generar 32 bytes aleatorios y los pasamos a hexa.
 * 2. elegimos una fecha de vencimiento respecto a la fecha actual
 */

const DIAS_VALIDEZ_INVITACION = 7;
//tipo:dato validacion
export const crearCliente = async (dto: CrearClienteDto) => {
    const token = randomBytes(32).toString('hex');
    const expiracion = new Date(Date.now() + DIAS_VALIDEZ_INVITACION * 24 * 60 * 60 * 1000); // en ms
    //debemos usar await, de lo contrario seguiria ejecutandose sin esperar a la base de datos
    try {
        const { usuario, cliente } = await repository.crearClienteConInvitacion(dto, token, expiracion);
        return toClienteDto(usuario, cliente, token, expiracion); //armamos la respeusta final
    } catch (error) {
        // 23505 = violacion de UNIQUE en postgres (email o cuit repetido)
        if ((error as { code?: string }).code === '23505') {
            throw new AppError('Ya existe un usuario con ese email o un cliente con ese CUIT', 409, true);
        }
        throw error;
    }
};
