-- v0.4 - Ejecucion ordenada de migraciones
-- Nota: estos SOURCE funcionan en cliente mysql/CLI.

SOURCE ./DDL/001_v0_4_pedidos_cantidad_fabricada.sql;
SOURCE ./DDL/002_v0_4_fabricacion_semanal_fecha_inicio.sql;
SOURCE ./DDL/003_v0_4_estados_default_y_normalizacion.sql;
SOURCE ./DDL/005_v0_4_productos_operarios_codigo_batidero.sql;
SOURCE ./DDL/006_v0_4_trazabilidad_fabricacion_fabricacion_semanal_id.sql;
SOURCE ./DDL/007_v0_4_ambientes_3_tomas_en_columnas.sql;
SOURCE ./DDL/008_v0_4_cubicaje_duelas.sql;
SOURCE ./DDL/009_v0_4_cubicaje_id_autonumerico.sql;
SOURCE ./DDL/010_v0_4_palets_campos_tipo_material.sql;
SOURCE ./DDL/011_v0_4_drop_stocks.sql;
