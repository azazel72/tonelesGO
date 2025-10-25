<?php
declare(strict_types=1);
function ok($data, array $meta=[]): void {
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['data'=>$data,'meta'=>$meta], JSON_UNESCAPED_UNICODE);
  exit;
}
function error(int $code, string $msg, array $extra=[]): void {
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['error'=>$msg]+$extra, JSON_UNESCAPED_UNICODE);
  exit;
}
function bodyJson(): array {
  $raw=file_get_contents('php://input')?:''; if($raw==='') return [];
  $d=json_decode($raw,true); if(!is_array($d)) error(400,'JSON inválido.'); return $d;
}
