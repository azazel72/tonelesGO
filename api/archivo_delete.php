<?php
declare(strict_types=1);

require_once __DIR__.'/config.php';

function db(): PDO {
  return new PDO(DB_DSN, DB_USER, DB_PASS, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
}

function json_error(int $code, string $message): void {
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
  exit;
}

function json_ok(array $data): void {
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['data' => $data], JSON_UNESCAPED_UNICODE);
  exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if (!in_array($method, ['POST', 'DELETE'], true)) {
  json_error(405, 'Metodo no permitido.');
}

$id = null;
if ($method === 'DELETE') {
  $raw = file_get_contents('php://input') ?: '';
  parse_str($raw, $data);
  $id = $data['id'] ?? null;
} else {
  $id = $_POST['id'] ?? null;
}

if (!is_string($id) || !ctype_digit($id)) {
  json_error(400, 'ID invalido.');
}

$pdo = db();
$stmt = $pdo->prepare(
  "SELECT nombre_archivo
   FROM archivos_subidos
   WHERE id = :id AND is_deleted = 0"
);
$stmt->execute(['id' => (int)$id]);
$row = $stmt->fetch();
if (!$row) {
  json_error(404, 'Archivo no encontrado.');
}

$uploadRoot = realpath(__DIR__.'/..');
if ($uploadRoot === false) {
  json_error(500, 'Ruta base invalida.');
}
$filePath = $uploadRoot . DIRECTORY_SEPARATOR . 'archivos' . DIRECTORY_SEPARATOR . $row['nombre_archivo'];
if (is_file($filePath) && !unlink($filePath)) {
  json_error(500, 'No se pudo eliminar el archivo.');
}

$stmt = $pdo->prepare(
  "UPDATE archivos_subidos
   SET is_deleted = 1, deleted_at = NOW()
   WHERE id = :id"
);
$stmt->execute(['id' => (int)$id]);

json_ok(['id' => (int)$id]);
