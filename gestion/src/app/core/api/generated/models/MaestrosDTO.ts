/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AmbienteDTO } from './AmbienteDTO';
import type { ArchivoSubidoDTO } from './ArchivoSubidoDTO';
import type { ClienteDTO } from './ClienteDTO';
import type { DuelaDTO } from './DuelaDTO';
import type { EntradaDTO } from './EntradaDTO';
import type { EntradaFlejeDTO } from './EntradaFlejeDTO';
import type { EstadoDTO } from './EstadoDTO';
import type { InstalacionDTO } from './InstalacionDTO';
import type { LineaEntradaDTO } from './LineaEntradaDTO';
import type { MaterialDTO } from './MaterialDTO';
import type { PaletDTO } from './PaletDTO';
import type { ProductoDTO } from './ProductoDTO';
import type { ProveedorDTO } from './ProveedorDTO';
import type { PuestoTrabajoDTO } from './PuestoTrabajoDTO';
import type { RolDTO } from './RolDTO';
import type { UbicacionDTO } from './UbicacionDTO';
import type { UsuarioDTO } from './UsuarioDTO';
export type MaestrosDTO = {
    clientes?: (Record<string, ClienteDTO> | null);
    estados?: (Record<string, EstadoDTO> | null);
    estados_ordenes_fabricacion?: (Record<string, EstadoDTO> | null);
    estados_lineas_fabricacion?: (Record<string, EstadoDTO> | null);
    estados_botas?: (Record<string, EstadoDTO> | null);
    estados_trazabilidad_fabricacion?: (Record<string, EstadoDTO> | null);
    estados_palets?: (Record<string, EstadoDTO> | null);
    instalaciones?: (Record<string, InstalacionDTO> | null);
    ubicaciones?: (Record<string, UbicacionDTO> | null);
    proveedores?: (Record<string, ProveedorDTO> | null);
    usuarios?: (Record<string, UsuarioDTO> | null);
    roles?: (Record<string, RolDTO> | null);
    puestos_trabajo?: (Record<string, PuestoTrabajoDTO> | null);
    materiales?: (Record<string, MaterialDTO> | null);
    duelas?: (Record<string, DuelaDTO> | null);
    entradas?: (Record<string, EntradaDTO> | null);
    lineas_entrada?: (Record<string, LineaEntradaDTO> | null);
    palets?: (Record<string, PaletDTO> | null);
    productos?: (Record<string, ProductoDTO> | null);
    archivos_subidos?: (Record<string, ArchivoSubidoDTO> | null);
    ambientes?: (Record<string, AmbienteDTO> | null);
    entradas_flejes?: (Record<string, EntradaFlejeDTO> | null);
};

