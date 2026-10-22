import { type UsuarioRow, type EmpleadoRow } from './empleado.repository.ts';

// el mapper arma la respuesta de la API a partir de las filas de la base.
// por que existe: la base y la API no tienen por que tener la misma forma. Aca se decide
// que campos se muestran, como se agrupan y que nunca se devuelve (por ejemplo password_hash).
// si cambia una columna, se ajusta aca y la respuesta de la API sigue igual.
// aca estado_empleo se devuelve como "estado", igual que el pedido del Ejercicio 10
export const toEmpleadoDto = (usuario: UsuarioRow, empleado: EmpleadoRow, token: string, expiracion: Date) => ({
    id: empleado.id, // el que usan los otros servicios como empleado_id
    usuario_id: usuario.id,
    email: usuario.email,
    nombre_completo: usuario.nombre_completo,
    telefono: usuario.telefono,
    activo: usuario.activo,
    estado: empleado.estado_empleo,
    fecha_ingreso: empleado.fecha_ingreso,
    // en el sistema real este token viaja por correo. como el MVP no envia mails,
    // se devuelve en la respuesta para poder probar la activacion
    invitacion: { token, expira: expiracion.toISOString() },
});
