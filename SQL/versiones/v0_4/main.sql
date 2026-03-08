-- v0.4 - Ejecucion ordenada de migraciones
-- Nota: estos SOURCE funcionan en cliente mysql/CLI.

SOURCE ./DDL/001_v0_4_pedidos_cantidad_fabricada.sql;
SOURCE ./DDL/002_v0_4_fabricacion_semanal_fecha_inicio.sql;
SOURCE ./DDL/003_v0_4_estados_default_y_normalizacion.sql;
SOURCE ./DDL/004_v0_4_stocks.sql;
SOURCE ./DDL/005_v0_4_productos_operarios_codigo_batidero.sql;
