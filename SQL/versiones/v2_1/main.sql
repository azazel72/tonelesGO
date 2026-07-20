-- v2.1 - Ejecucion ordenada de migraciones
-- Nota: estos SOURCE funcionan en cliente mysql/CLI.

SOURCE ./DDL/001_v2_1_pedidos_cliente.sql;
SOURCE ./DDL/002_v2_1_eliminar_entidad_duelas.sql;
SOURCE ./DDL/003_v2_1_pedidos_destino.sql;
SOURCE ./DDL/004_v2_1_contenedores.sql;
SOURCE ./DDL/005_v2_1_trazabilidad_movimientos.sql;
SOURCE ./DDL/006_v2_1_analiticas.sql;
SOURCE ./DDL/010_v2_1_analiticas_nuevos_campos.sql;
SOURCE ./DDL/007_v2_1_trazabilidad_fabricacion_fabricacion_semanal_nullable.sql;
SOURCE ./DDL/008_v2_1_puestos_trabajo_orden.sql;
SOURCE ./DDL/011_v2_1_tostados.sql;
SOURCE ./DDL/012_v2_1_estados_flejes.sql;
SOURCE ./DDL/013_v2_1_dias_festivos.sql;
SOURCE ./DDL/014_v2_1_desactivado_usuarios_puestos.sql;
SOURCE ./DDL/015_v2_1_eliminar_activo_puestos_trabajo.sql;
SOURCE ./DDL/016_v2_1_activo_usuarios_puestos.sql;
SOURCE ./DDL/017_v2_1_puestos_trabajo_listado.sql;
