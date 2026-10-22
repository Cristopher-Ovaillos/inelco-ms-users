import { type UsuarioRow, type ClienteRow } from './cliente.repository.ts';

export const toClienteDto = (usuario: UsuarioRow, cliente: ClienteRow, token: string, expiracion: Date) => ({
    id: cliente.id, // el que usan los otros servicios como cliente_id
    usuario_id: usuario.id,
    email: usuario.email,
    nombre_completo: usuario.nombre_completo,
    telefono: usuario.telefono,
    activo: usuario.activo,
    razon_social: cliente.razon_social,
    direccion: cliente.direccion,
    contacto_adicional: cliente.contacto_adicional,
    info_comercial: cliente.info_comercial,
    invitacion: { token, expira: expiracion.toISOString() },
});
