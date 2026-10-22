import { z } from 'zod';
// esquemas de validacion de los tres endpoints de empleados.
// validan la forma del pedido (tipos, largos, formato). las reglas que dependen de la base
// (que el empleado o el permiso existan) las valida el service.

// el id del empleado viaja en la URL: si no es un UUID se corta con 400 antes de tocar la base
const empleadoIdParam = z.object({
    empleado_id: z.uuid('El id del empleado debe ser un UUID'),
});

export const crearEmpleadoSchema = z.object({
    body: z.object({
        usuario: z.object({
            email: z.email('Email inválido'),
            nombre_completo: z.string().min(1, 'El nombre es obligatorio').max(150),
            telefono: z.string().max(50).optional(),
        }),
        empleado: z.object({
            // mismos valores que el enum tipo_estado_empleo de la base
            estado: z.enum(['activo', 'licencia', 'baja'], 'El estado debe ser activo, licencia o baja'),
            // z.iso.date() exige YYYY-MM-DD y rechaza fechas que no existen (2026-02-30)
            fecha_ingreso: z.iso.date('La fecha debe tener formato YYYY-MM-DD'),
        }),
    }),
});

export const asignarPermisosSchema = z.object({
    params: empleadoIdParam,
    body: z.object({
        permisos: z.array(z.string().min(1)).min(1, 'Se debe enviar al menos un permiso'),
    }),
});

export const asignarEspecialidadSchema = z.object({
    params: empleadoIdParam,
    body: z.object({
        especialidad_id: z.number().int().positive('La especialidad debe ser un id válido'),
    }),
});

// lo anterior define lo que recibimos, pero la info esta en el body: la sacamos del esquema.
export type CrearEmpleadoDto = z.infer<typeof crearEmpleadoSchema>['body'];
export type AsignarEspecialidadDto = z.infer<typeof asignarEspecialidadSchema>['body'];
