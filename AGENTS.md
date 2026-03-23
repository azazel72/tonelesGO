# AGENTS.md

Este archivo queda reservado para instrucciones operativas estables del repositorio.

## Reglas de versionado

- La version visible de la aplicacion puede cambiar en frontend sin implicar cambio de version de BBDD.
- En una version `major.minor.patch`, la BBDD solo cambia cuando el usuario pida cambiar `major` o `minor`.
- Si solo cambia `patch`, no se cambia la version de la BBDD.

## Reglas permanentes para nuevas funcionalidades en frontend movil

- Cada nuevo boton en el frontend del movil implica crear nuevas funcionalidades, creando de cero las funciones, y el html de la vista.
- Normalmente cada nueva funcionalidad debe llevar su propio archivo `js`.
- Sera necesario actualizar los archivos principales `index.html` y `terminal.js`.
- NUNCA se borra la funcionalidad de otro boton. Si el usuario quiere eso, lo pedira en otra instruccion para limpiar codigo.
- NUNCA se edita el codigo de otra funcionalidad.
- Si el usuario quisiera editar una funcionalidad existente, lo pedira expresamente como una modificacion, no como una creacion.
