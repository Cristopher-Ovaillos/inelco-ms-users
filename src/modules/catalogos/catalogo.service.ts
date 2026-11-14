import * as repository from './catalogo.repository.ts';

export const listarPermisos = () => {
    return repository.listarPermisos();
}

export const listarEspecialidades = () => {
    return repository.listarEspecialidades();
}