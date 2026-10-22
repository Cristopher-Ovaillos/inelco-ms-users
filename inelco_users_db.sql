/*
  base de usuarios segun el MER (inelco_users_db)

  la base se crea aparte, una sola vez:
    psql -U postgres -c "CREATE DATABASE inelco_users_db"

  y despues se corre este script dentro de ella:
    psql -U postgres -d inelco_users_db -f inelco_users_db.sql

  desde psql tambien sirve: \c inelco_users_db y luego \i inelco_users_db.sql
  se puede ejecutar varias veces, las tablas y los datos iniciales no se duplican
*/

-- habilitar extension para generacion nativa de uuids
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

/*
  enum del MER: estado_empleo

  CREATE TYPE no tiene IF NOT EXISTS, por eso se captura el error si el tipo ya existe
  y asi el script se puede volver a correr.
*/
DO $$ BEGIN
    CREATE TYPE tipo_estado_empleo AS ENUM ('activo', 'licencia', 'baja');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


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
    nombre_completo VARCHAR(150) NOT NULL,
    telefono VARCHAR(50),
    activo BOOLEAN NOT NULL DEFAULT FALSE,
    last_login TIMESTAMPTZ NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


/*
  subclases (ISA del MER: Cliente y Empleado son especializaciones de Usuario)

  usuario_id es FK y UNIQUE: cada usuario tiene a lo sumo una fila en cada tabla.
  el id propio de clientes y empleados es el que usan los otros servicios como
  cliente_id y empleado_id.
*/
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    razon_social VARCHAR(150) NOT NULL,
    direccion VARCHAR(255),
    contacto_adicional VARCHAR(150),
    info_comercial TEXT
);

CREATE TABLE IF NOT EXISTS empleados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    estado_empleo tipo_estado_empleo NOT NULL DEFAULT 'activo',
    fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE
);


/*
  permisos (relacion N:M "posee" del MER)

  se asignan directo a cada empleado, sin pasar por roles. empleado_permisos es la
  tabla intermedia y su clave es la pareja (empleado, permiso).
*/
CREATE TABLE IF NOT EXISTS permisos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS empleado_permisos (
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    permiso_id INTEGER NOT NULL REFERENCES permisos(id) ON DELETE CASCADE,
    PRIMARY KEY (empleado_id, permiso_id)
);


/*
  especialidades (relacion N:M "domina" del MER)

  sirven para repartir las consultas entre los tecnicos segun su especialidad.
*/
CREATE TABLE IF NOT EXISTS especialidades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS empleado_especialidades (
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    especialidad_id INTEGER NOT NULL REFERENCES especialidades(id) ON DELETE CASCADE,
    PRIMARY KEY (empleado_id, especialidad_id)
);


/*
  tokens de invitacion y activacion

  un token se usa una sola vez: usado pasa a true y ya no sirve aunque no haya vencido.
*/
CREATE TABLE IF NOT EXISTS tokens_invitacion (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_expiracion TIMESTAMPTZ NOT NULL
);


/*
  datos iniciales

  solo los catalogos. usuarios, clientes y empleados no se siembran aca: se crean por la
  API, porque necesitan su token de invitacion. los permisos son los del informe; las
  especialidades son de ejemplo, ajustarlas a lo que realmente atiende inelco.
*/
INSERT INTO permisos (codigo, descripcion) VALUES
    ('VER_CONSULTAS', 'ver las consultas asignadas y las del equipo'),
    ('RESPONDER_CHAT', 'responder en el chat con el cliente'),
    ('APROBAR_SOLUCION', 'aprobar y publicar soluciones')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO especialidades (nombre, descripcion) VALUES
    ('Incendio', 'sistemas de deteccion y proteccion contra incendios'),
    ('CCTV', 'camaras y videovigilancia'),
    ('Control de acceso', 'lectores, cerraduras y molinetes'),
    ('Alarmas', 'alarmas de intrusion y sensores')
ON CONFLICT (nombre) DO NOTHING;
