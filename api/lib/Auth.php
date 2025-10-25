<?php
declare(strict_types=1);
require_once __DIR__.'/Response.php';
require_once __DIR__.'/../config.php';

function touchSessionActivity(): void { $_SESSION['last_activity'] = time(); }
function sessionExpired(): bool {
  return !isset($_SESSION['last_activity']) || time()-$_SESSION['last_activity'] > SESSION_INACTIVITY_SECONDS;
}
function ensureSessionFresh(): void {
  if (!isset($_SESSION['uid'])) error(401,'No autenticado.');
  if (sessionExpired()) { session_unset(); session_destroy(); error(401,'Sesión expirada por inactividad.'); }
  touchSessionActivity();
}

function can(string $op, string $table, array $ACL): bool {
  $role = $_SESSION['role'] ?? 'viewer';

  // Reglas específicas de la tabla
  if (isset($ACL[$table][$op])) {
    $allowed = $ACL[$table][$op];
  } else {
    // Defaults globales '*'
    $allowed = $ACL['*'][$op] ?? [];
  }

  // Soporta string '*' (permitir a todos) o array de roles
  if ($allowed === '*') return true;
  return in_array($role, (array)$allowed, true);
}

function ensureCan(string $op, string $table, array $ACL): void {
  if (!can($op, $table, $ACL)) {
    error(403, 'Operación no permitida.', [
      'op' => $op, 'table' => $table, 'role' => ($_SESSION['role'] ?? 'viewer')
    ]);
  }
}


function loginHandler(PDO $pdo): void {
  $p=bodyJson();
  $u=trim((string)($p['username']??'')); $pw=(string)($p['password']??'');
  if($u===''||$pw==='') error(400,'username y password requeridos.');
  $st=$pdo->prepare("SELECT id,username,fullname,password_hash,role FROM usuarios WHERE username=:u LIMIT 1");
  $st->execute(['u'=>$u]); $user=$st->fetch();
  if(!$user || !password_verify($pw,$user['password_hash'])) error(401,'Credenciales inválidas.');
  session_regenerate_id(true);
  $_SESSION['uid']=(int)$user['id']; $_SESSION['username']=$user['username']; $_SESSION['role']=$user['role']?:'viewer';
  touchSessionActivity();
  ok(['id'=>$user['id'],'username'=>$user['username'],'role'=>$_SESSION['role'],'fullname'=>$user['fullname']], ['message'=>'login ok']);
}
function logoutHandler(): void {
  ensureSessionFresh(); session_unset(); session_destroy(); ok(['ok'=>true], ['message'=>'logout ok']);
}
