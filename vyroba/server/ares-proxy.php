<?php
/*
 * Mezikrok na ARES pro aplikaci Přehled zakázek — varianta pro PHP hosting.
 *
 * Nahrajte jako /api/ares/index.php a v aplikaci (Číselníky → Zákazníci)
 * vyplňte https://vas-server.cz/api/ares
 * Vyžaduje přepis adresy na tento skript, nebo volejte ...?ico=12345678
 */
declare(strict_types=1);

$origin = getenv('ALLOW_ORIGIN') ?: '*';
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Headers: Accept, Content-Type');
header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { http_response_code(204); exit; }

$raw = $_GET['ico'] ?? basename(parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?: '');
$ico = preg_replace('/\D/', '', (string) $raw);

if (strlen($ico) !== 8) {
    http_response_code(400);
    echo json_encode(['chyba' => 'IČO musí mít 8 číslic.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$ch = curl_init('https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/' . $ico);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => ['Accept: application/json'],
    CURLOPT_TIMEOUT        => 12,
]);
$body = curl_exec($ch);
$code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
$err  = curl_error($ch);
curl_close($ch);

if ($body === false) {
    http_response_code(502);
    echo json_encode(['chyba' => 'ARES neodpověděl: ' . $err], JSON_UNESCAPED_UNICODE);
    exit;
}
if ($code === 404) {
    http_response_code(404);
    echo json_encode(['chyba' => 'IČO ' . $ico . ' nebylo v ARES nalezeno.'], JSON_UNESCAPED_UNICODE);
    exit;
}
http_response_code($code);
echo $body;
