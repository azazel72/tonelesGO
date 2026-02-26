-- v0.3 - Ejecucion ordenada de migraciones
-- Nota: estos SOURCE funcionan en cliente mysql/CLI.

SOURCE ./DDL/002_v0_3_duelas_tipo_producto_y_tipos_producto_sin_consumo.sql;
SOURCE ./DDL/003_v0_3_consumos.sql;
SOURCE ./DML/002_v0_3_tipos_producto_duela_seed.sql;
SOURCE ./DML/003_v0_3_duelas_tipo_producto_backfill.sql;
