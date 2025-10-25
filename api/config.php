<?php
declare(strict_types=1);

const DB_DSN  = 'mysql:host=localhost;dbname=paezlobato;charset=utf8mb4';
const DB_USER = 'paezlobato';
const DB_PASS = 'paezlobato';

const ALLOW_ALL = true;
$ALLOWED_TABLES = ['usuarios','clientes','polizas'];

const SESSION_INACTIVITY_SECONDS = 150*60;

// ACL por recurso: tabla → operación → [roles permitidos]
// Usa '*' para defaults globales.
$ACL = [
  '*' => [ // defaults (todas las tablas salvo override)
    'list'        => ['admin','editor','viewer'],
    'read'        => ['admin','editor','viewer'],
    'create'      => ['admin','editor'],
    'update'      => ['admin','editor'],
    'delete'      => ['admin','editor'],      // soft delete
    'restore'     => ['admin','editor'],
    'hard_delete' => ['admin'],
    'meta'        => ['admin'],               // /?tables=...
  ],

  // Overrides por tabla
  'usuarios' => [
    'list'        => ['admin'],               // p.ej. solo admin ve usuarios
    'read'        => ['admin'],
    'create'      => ['admin'],
    'update'      => ['admin'],
    'delete'      => ['admin'],
    'restore'     => ['admin'],
    'hard_delete' => ['admin'],
  ],

  // Ejemplo extra:
  // 'polizas' => [
  //   'hard_delete' => [], // nadie
  // ],
];