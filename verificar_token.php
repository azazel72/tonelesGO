<?php
require 'vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$clave_secreta = 'tu_clave_secreta_super_segura';
$duracion_token = 600; // 10 minutos

// Extraer token del encabezado
$headers = apache_request_headers();
if (!isset($headers['Authorization'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Token no enviado']);
    exit;
}

$jwt = str_replace('Bearer ', '', $headers['Authorization']);

try {
    $decoded = JWT::decode($jwt, new Key($clave_secreta, 'HS256'));

    // Renovar token: genera nuevo con expiración desde ahora
    $ahora = time();
    $nuevoPayload = [
        'sub' => $decoded->sub,
        'name' => $decoded->name,
        'rol' => $decoded->rol,
        'iat' => $ahora,
        'exp' => $ahora + $duracion_token
    ];

    $nuevoJwt = JWT::encode($nuevoPayload, $clave_secreta, 'HS256');

    // Respuesta con nuevo token y datos
    echo json_encode([
        'token' => $nuevoJwt,
        'name' => $decoded->name,
        'rol' => $decoded->rol,
        'expira' => $nuevoPayload['exp']
    ]);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Token inválido o expirado', 'detalle' => $e->getMessage()]);
    exit;
}
