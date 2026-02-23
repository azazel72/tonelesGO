-- v0.3 - Ejecucion ordenada de migraciones
-- Nota: estos SOURCE funcionan en cliente mysql/CLI.

SOURCE ./DDL/001_v0_3_bootstrap.sql;
SOURCE ./DML/001_v0_3_seed_placeholder.sql;

