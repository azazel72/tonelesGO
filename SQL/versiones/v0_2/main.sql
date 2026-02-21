-- v0.2 - Ejecución ordenada de migraciones
-- Nota: estos SOURCE funcionan en cliente mysql/CLI.

SOURCE ./DDL/001_v0_2_estados_por_entidad_sin_fk.sql;
SOURCE ./DML/001_v0_2_estados_por_entidad_seed.sql;
SOURCE ./DDL/002_v0_2_estados_por_entidad_fk.sql;

SOURCE ./DDL/003_v0_2_fabricacion_estructura_sin_fk.sql;
SOURCE ./DML/002_v0_2_fabricacion_backfill.sql;
SOURCE ./DDL/004_v0_2_fabricacion_fk.sql;
