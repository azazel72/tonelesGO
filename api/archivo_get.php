<?php
declare(strict_types=1);

require_once __DIR__.'/config.php';

function db(): PDO {
  return new PDO(DB_DSN, DB_USER, DB_PASS, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
}

$id = $_GET['id'] ?? '';
if (!is_string($id) || !ctype_digit($id)) {
  http_response_code(400);
  echo 'ID invalido.';
  exit;
}

$pdo = db();
$stmt = $pdo->prepare(
  "SELECT nombre_archivo, nombre_original, extension
   FROM archivos_subidos
   WHERE id = :id AND is_deleted = 0"
);
$stmt->execute(['id' => (int)$id]);
$row = $stmt->fetch();
if (!$row) {
  http_response_code(404);
  echo 'Archivo no encontrado.';
  exit;
}

$uploadRoot = realpath(__DIR__.'/..');
if ($uploadRoot === false) {
  http_response_code(500);
  echo 'Ruta base invalida.';
  exit;
}
$filePath = $uploadRoot . DIRECTORY_SEPARATOR . 'archivos' . DIRECTORY_SEPARATOR . $row['nombre_archivo'];
if (!is_file($filePath)) {
  http_response_code(404);
  echo 'Archivo no encontrado.';
  exit;
}

$extension = strtolower((string)$row['extension']);
$mime = $extension === 'pdf' ? 'application/pdf' : 'image/jpeg';
$original = (string)$row['nombre_original'];

header('Content-Type: ' . $mime);
header('Content-Disposition: inline; filename="' . addslashes($original) . '"');
header('Content-Length: ' . filesize($filePath));
readfile($filePath);
