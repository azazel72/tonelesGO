-- v0.2 - Ejecución ordenada de migraciones
-- Nota: estos SOURCE funcionan en cliente mysql/CLI.

SOURCE ./DDL/001_v0_2_estados_por_entidad_sin_fk.sql;
SOURCE ./DML/001_v0_2_estados_por_entidad_seed.sql;
SOURCE ./DDL/002_v0_2_estados_por_entidad_fk.sql;

SOURCE ./DDL/003_v0_2_fabricacion_estructura_sin_fk.sql;
SOURCE ./DML/002_v0_2_fabricacion_backfill.sql;
SOURCE ./DDL/004_v0_2_fabricacion_fk.sql;
SOURCE ./DDL/005_v0_2_ambientes.sql;
SOURCE ./DDL/006_v0_2_productos_botas_estructura.sql;
SOURCE ./DDL/007_v0_2_botas_renombrar_producto_a_fleje.sql;
SOURCE ./DDL/008_v0_2_entradas_flejes_y_tipos_producto_tipo.sql;
