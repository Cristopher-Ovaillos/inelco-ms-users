import { z } from 'zod';
//esquema de validacion, definimos como debe verse lo que llega al crear un cliente
//rechazamos lo que no cumpla, es simplemente para que no toque la bd

//se empieza siempre definiendo el objeto con sus campos
//estamos hablando de un post, en nuestra logica de negocio separamos la info de un usuario que es el que tiene cualquiera ya sea empleado, etc.
//y la info de un cliente que esto es mas especifico a la subclase

export const crearClienteSchema = z.object({
    body: z.object({
        usuario: z.object({
            email: z.email('Email inválido'),
            nombre_completo: z.string().min(1, 'El nombre es obligatorio').max(150),
            telefono: z.string().max(50).optional(),
        }),
        cliente: z.object({
            razon_social: z.string().min(1, 'La razón social es obligatoria').max(150),
            direccion: z.string().max(255).optional(),
            contacto_adicional: z.string().max(150).optional(),
            info_comercial: z.string().optional(),
        }),
    }),
});

// lo anterior definimos como debe ser lo que recibimos, pero esta info esta en el body de la peticion.
//lo sacamos del esqumema.
export type CrearClienteDto = z.infer<typeof crearClienteSchema>['body'];
