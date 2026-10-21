/*
  base de usuarios (clientes, empleados, permisos, invitaciones)

  la base se crea aparte, una sola vez:
    psql -U postgres -c "CREATE DATABASE inelco_users_db"

  y despues se corre este script dentro de ella:
    psql -U postgres -d inelco_users_db -f inelco_users_db.sql

  desde psql tambien sirve: \c inelco_users_db y luego \i inelco_users_db.sql
  se puede ejecutar varias veces, las tablas y los permisos iniciales no se duplican
*/

-- habilitar extension para generacion nativa de uuids
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


/*
  usuarios: entidad base

  el id es uuid y no serial porque viaja a los otros servicios (tickets, chat) como
  referencia logica, y un numero correlativo seria facil de adivinar.

  la cuenta nace sin password_hash y con activo en false: se completan cuando la
  persona usa el token de invitacion (ver tokens_invitacion).
*/
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(50),
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('cliente', 'empleado')),
    activo BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


/*
  subclases

  cada usuario tiene una sola fila en clientes o en empleados segun tipo_usuario.
  el cuit es varchar porque se guarda con o sin guiones, segun como lo cargue cada uno.
*/
CREATE TABLE IF NOT EXISTS clientes (
    usuario_id UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    razon_social VARCHAR(150) NOT NULL,
    cuit VARCHAR(20) NOT NULL UNIQUE,
    direccion_fiscal TEXT,
    plan_servicio VARCHAR(50) DEFAULT 'Estandar'
);

CREATE TABLE IF NOT EXISTS empleados (
    usuario_id UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    legajo VARCHAR(30) NOT NULL UNIQUE,
    cargo VARCHAR(100) NOT NULL,
    area_especialidad VARCHAR(100)
);


/*
  permisos

  se asignan directo a cada empleado, sin pasar por roles. empleado_permisos es la
  tabla intermedia y su clave es la pareja (empleado, permiso).
*/
CREATE TABLE IF NOT EXISTS permisos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS empleado_permisos (
    empleado_id UUID REFERENCES empleados(usuario_id) ON DELETE CASCADE,
    permiso_id INTEGER REFERENCES permisos(id) ON DELETE CASCADE,
    PRIMARY KEY (empleado_id, permiso_id)
);


/*
  tokens de invitacion y activacion

  un token se usa una sola vez: usado pasa a true y ya no sirve aunque no haya vencido.
*/
CREATE TABLE IF NOT EXISTS tokens_invitacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    fecha_expiracion TIMESTAMP WITH TIME ZONE NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


/*
  datos iniciales

  solo el catalogo de permisos. usuarios no se siembran aca porque necesitan password
  hasheado y eso lo genera la aplicacion. los codigos son de ejemplo, ajustarlos a las
  acciones reales del sistema.
*/
INSERT INTO permisos (codigo, descripcion) VALUES
    ('ver_consultas', 'ver las consultas asignadas y las del equipo'),
    ('responder_consultas', 'responder y cerrar consultas'),
    ('asignar_tecnicos', 'asignar o reasignar consultas a otro tecnico'),
    ('gestionar_usuarios', 'crear, editar y dar de baja clientes y empleados'),
    ('ver_reportes', 'acceder a metricas y reportes')
ON CONFLICT (codigo) DO NOTHING;
