<?php
require 'vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$clave_secreta = 'tu_clave_secreta_super_segura';
$duracion_token = 600; // 10 minutos

// Conexión a la base de datos
$pdo = new PDO("mysql:host=localhost;dbname=tu_basedatos", "usuario", "clave");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Recoger datos de entrada (usuario y clave)
$data = json_decode(file_get_contents("php://input"), true);
$usuario = $data['usuario'] ?? '';
$clave = $data['clave'] ?? '';

// Buscar usuario en BBDD
$sql = "SELECT * FROM usuarios WHERE usuario = :usuario";
$stmt = $pdo->prepare($sql);
$stmt->execute(['usuario' => $usuario]);
$usuarioData = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$usuarioData || !password_verify($clave, $usuarioData['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Credenciales incorrectas']);
    exit;
}

// Generar JWT
$ahora = time();
$payload = [
    'sub' => $usuarioData['id'],
    'name' => $usuarioData['nombre_completo'],
    'rol' => $usuarioData['rol'],
    'iat' => $ahora,
    'exp' => $ahora + $duracion_token
];

$jwt = JWT::encode($payload, $clave_secreta, 'HS256');

// Devolver token y datos útiles
echo json_encode([
    'token' => $jwt,
    'name' => $usuarioData['nombre_completo'],
    'rol' => $usuarioData['rol'],
    'expira' => $payload['exp']
]);
