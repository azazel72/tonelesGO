<?php

declare(strict_types=1);

require_once __DIR__.'/bootstrap.php';
require_once __DIR__.'/lib/Response.php';
require_once __DIR__.'/lib/Auth.php';
require_once __DIR__.'/lib/OpenApi.php';
require_once __DIR__.'/lib/Crud.php';
require_once __DIR__.'/lib/DbMeta.php';

// --- CORS para cualquier origen (REFLEJA Origin) ---
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin) {
  header("Access-Control-Allow-Origin: $origin"); // NO usar '*'
  header('Vary: Origin');
  header('Access-Control-Allow-Credentials: true'); // cookies
  header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, X-CSRF-Token');
}
// Preflight
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
  http_response_code(204);
  exit;
}


$pdo = pdo();

// OpenAPI
if (isset($_GET['openapi'])) {
  echo json_encode(openapiSpec(), JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
  exit;
}

// Auth
$action = $_GET['action'] ?? null;
if ($action === 'login'  && $_SERVER['REQUEST_METHOD']==='POST') { loginHandler($pdo); }
if ($action === 'logout' && $_SERVER['REQUEST_METHOD']==='POST') { logoutHandler(); }

// Meta
if (isset($_GET['tables'])) {
  ensureSessionFresh();
  require_once __DIR__.'/../config.php';
  global $ALLOWED_TABLES, $ACL;
  if (!can('meta','_meta', $ACL)) error(403, 'Sin permiso de metadatos.');

  $schema = dbSchemaFromDsn();
  $with = isset($_GET['with']) ? explode(',', (string)$_GET['with']) : [];
  $like = isset($_GET['like']) ? (string)$_GET['like'] : null;

  $tables = ALLOW_ALL ? listAllTables($pdo,$schema) : $ALLOWED_TABLES;
  if ($like && $like!=='') {
    $pat='/^'.str_replace(['%','_'],['.*','.'],preg_quote($like,'/')).'$/i';
    $tables = array_values(array_filter($tables, fn($t)=>preg_match($pat,$t)));
  }

  $out=[];
  foreach($tables as $t){
    $item=['table'=>$t];
    if(in_array('pk',$with,true))      $item['primary_key']=tablePrimaryKey($pdo,$schema,$t);
    if(in_array('columns',$with,true)) $item['columns']=tableColumnsFull($pdo,$schema,$t);
    $out[]=$item;
  }
  ok($out, ['schema'=>$schema,'count'=>count($out)]);
}

// CRUD
handleCrud($pdo);
