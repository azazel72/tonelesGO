<?php
declare(strict_types=1);
require_once __DIR__.'/config.php';

ini_set('session.use_strict_mode','1');
ini_set('session.gc_maxlifetime', (string)SESSION_INACTIVITY_SECONDS);
session_set_cookie_params([
  'lifetime'=>0,'path'=>'/','domain'=>'',
  'secure'=> isset($_SERVER['HTTPS']) && $_SERVER['HTTPS']==='on',
  'httponly'=>true,'samesite'=>'Strict'
]);
session_start();

function pdo(): PDO {
  static $pdo=null;
  if($pdo===null){
    $pdo = new PDO(DB_DSN, DB_USER, DB_PASS, [
      PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,
    ]);
    $pdo->exec("SET time_zone = '+00:00'");
    $pdo->exec("SET @audit_user = " . $pdo->quote((string)($_SESSION['username'] ?? 'guest')));
  }
  return $pdo;
}
