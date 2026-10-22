import { type UsuarioRow, type ClienteRow } from './cliente.repository.ts';

export const toClienteDto = (usuario: UsuarioRow, cliente: ClienteRow, token: string, expiracion: Date) => ({
    id: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    telefono: usuario.telefono,
    activo: usuario.activo,
    cliente,
    invitacion: { token, expira: expiracion.toISOString() },
});
