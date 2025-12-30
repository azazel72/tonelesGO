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

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  json_error(405, 'Metodo no permitido.');
}

$titulo = trim((string)($_POST['titulo'] ?? ''));
$entidad = trim((string)($_POST['entidad'] ?? ''));
$entidadId = trim((string)($_POST['entidad_id'] ?? ''));

if ($titulo === '') {
  json_error(400, 'Titulo requerido.');
}
if ($entidad === '' || $entidadId === '') {
  json_error(400, 'Entidad e ID requeridos.');
}
if (!ctype_digit($entidadId)) {
  json_error(400, 'ID de entidad invalido.');
}

if (!isset($_FILES['files'])) {
  json_error(400, 'No hay archivos.');
}

$files = $_FILES['files'];
$count = is_array($files['name']) ? count($files['name']) : 0;
if ($count === 0) {
  json_error(400, 'No hay archivos.');
}

$uploadRoot = realpath(__DIR__.'/..');
if ($uploadRoot === false) {
  json_error(500, 'No se pudo resolver la ruta base.');
}
$uploadDir = $uploadRoot . DIRECTORY_SEPARATOR . 'archivos';
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
  json_error(500, 'No se pudo crear la carpeta de subida.');
}

$maxBytes = 20 * 1024 * 1024;
$allowed = [
  'application/pdf' => 'pdf',
  'image/jpeg' => 'jpg',
  'image/pjpeg' => 'jpg',
];

$finfo = new finfo(FILEINFO_MIME_TYPE);
$pdo = db();
$ids = [];

for ($i = 0; $i < $count; $i++) {
  $errorCode = $files['error'][$i] ?? UPLOAD_ERR_NO_FILE;
  if ($errorCode !== UPLOAD_ERR_OK) {
    json_error(400, 'Error al subir archivo.');
  }

  $tmpName = (string)($files['tmp_name'][$i] ?? '');
  $size = (int)($files['size'][$i] ?? 0);
  if ($tmpName === '' || $size <= 0) {
    json_error(400, 'Archivo invalido.');
  }
  if ($size > $maxBytes) {
    json_error(400, 'Archivo demasiado grande.');
  }

  $mime = $finfo->file($tmpName) ?: '';
  if (!isset($allowed[$mime])) {
    json_error(400, 'Formato no permitido. Solo PDF o JPG.');
  }

  $extension = $allowed[$mime];
  $original = basename((string)($files['name'][$i] ?? 'archivo'));
  if ($original === '') {
    $original = 'archivo';
  }
  if (strlen($original) > 255) {
    $original = substr($original, 0, 255);
  }

  $baseName = pathinfo($original, PATHINFO_FILENAME);
  $baseName = preg_replace('/[^A-Za-z0-9._-]/', '_', $baseName);
  if ($baseName === '' || $baseName === '.' || $baseName === '..') {
    $baseName = 'archivo';
  }
  $timestamp = date('Ymd_His');
  $storedName = $baseName . '_' . $timestamp . '.' . $extension;
  $target = $uploadDir . DIRECTORY_SEPARATOR . $storedName;
  $n = 1;
  while (file_exists($target)) {
    $storedName = $baseName . '_' . $timestamp . '_' . $n . '.' . $extension;
    $target = $uploadDir . DIRECTORY_SEPARATOR . $storedName;
    $n++;
  }

  $stmt = $pdo->prepare(
    "INSERT INTO archivos_subidos
      (titulo, nombre_original, nombre_archivo, extension, entidad, entidad_id, created_at, updated_at, is_deleted)
     VALUES
      (:titulo, :nombre_original, :nombre_archivo, :extension, :entidad, :entidad_id, NOW(), NOW(), 0)"
  );
  $stmt->execute([
    'titulo' => $titulo,
    'nombre_original' => $original,
    'nombre_archivo' => $storedName,
    'extension' => $extension,
    'entidad' => $entidad,
    'entidad_id' => (int)$entidadId,
  ]);

  $id = (int)$pdo->lastInsertId();
  if (!move_uploaded_file($tmpName, $target)) {
    $pdo->prepare("DELETE FROM archivos_subidos WHERE id = :id")->execute(['id' => $id]);
    json_error(500, 'No se pudo guardar el archivo.');
  }

  $ids[] = $id;
}

json_ok(['ids' => $ids, 'count' => count($ids)]);
