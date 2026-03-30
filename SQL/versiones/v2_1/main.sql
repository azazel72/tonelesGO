-- v2.1 - Ejecucion ordenada de migraciones
-- Nota: estos SOURCE funcionan en cliente mysql/CLI.

SOURCE ./DDL/001_v2_1_pedidos_cliente.sql;
SOURCE ./DDL/002_v2_1_eliminar_entidad_duelas.sql;
SOURCE ./DDL/003_v2_1_pedidos_destino.sql;
SOURCE ./DDL/004_v2_1_contenedores.sql;
SOURCE ./DDL/005_v2_1_trazabilidad_movimientos.sql;
