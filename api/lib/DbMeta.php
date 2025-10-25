<?php
declare(strict_types=1);
require_once __DIR__.'/../config.php';

function dbSchemaFromDsn(): string {
  return preg_match('/dbname=([^;]+)/', DB_DSN, $m) ? $m[1] : '';
}

function requireTable(string $t, array $allow, bool $all): string {
  if($t==='') error(400,'Parámetro "table" requerido.');
  if(!preg_match('/^[A-Za-z0-9_]+$/',$t)) error(400,'Nombre de tabla inválido.');
  if(!$all && !in_array($t,$allow,true)) error(403,'Tabla no permitida.',['table'=>$t]);
  return $t;
}

function getPrimaryKey(PDO $pdo, string $table, ?string $schema=null): string {
  if($schema===null) $schema=dbSchemaFromDsn();
  static $cache=[];
  $key="$schema.$table";
  if(isset($cache[$key])) return $cache[$key];
  $st=$pdo->prepare("SELECT COLUMN_NAME FROM information_schema.key_column_usage
    WHERE table_schema=:s AND table_name=:t AND constraint_name='PRIMARY'
    ORDER BY ORDINAL_POSITION LIMIT 1");
  $st->execute(['s'=>$schema,'t'=>$table]); $r=$st->fetch();
  if(!$r) error(400,'No se encontró PK.',['table'=>$table]);
  return $cache[$key]=$r['COLUMN_NAME'];
}

function getColumns(PDO $pdo, string $table, ?string $schema=null): array {
  if($schema===null) $schema=dbSchemaFromDsn();
  static $cache=[];
  $key="$schema.$table";
  if(isset($cache[$key])) return $cache[$key];
  $st=$pdo->prepare("SELECT COLUMN_NAME FROM information_schema.columns
    WHERE table_schema=:s AND table_name=:t");
  $st->execute(['s'=>$schema,'t'=>$table]);
  $cols=array_map(fn($r)=>$r['COLUMN_NAME'],$st->fetchAll());
  if(!$cols) error(400,'No se pudieron obtener columnas.',['table'=>$table]);
  return $cache[$key]=$cols;
}

function listAllTables(PDO $pdo, string $schema): array {
  $st=$pdo->prepare("SELECT TABLE_NAME FROM information_schema.tables
    WHERE table_schema=:s AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME");
  $st->execute(['s'=>$schema]); return array_map(fn($r)=>$r['TABLE_NAME'],$st->fetchAll());
}

function tableColumnsFull(PDO $pdo,string $schema,string $table): array {
  $st=$pdo->prepare("SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA
    FROM information_schema.columns WHERE table_schema=:s AND table_name=:t ORDER BY ORDINAL_POSITION");
  $st->execute(['s'=>$schema,'t'=>$table]); return $st->fetchAll();
}

function tablePrimaryKey(PDO $pdo,string $schema,string $table): ?string {
  $st=$pdo->prepare("SELECT COLUMN_NAME FROM information_schema.key_column_usage
    WHERE table_schema=:s AND table_name=:t AND constraint_name='PRIMARY'
    ORDER BY ORDINAL_POSITION LIMIT 1");
  $st->execute(['s'=>$schema,'t'=>$table]); $r=$st->fetch(); return $r['COLUMN_NAME']??null;
}
