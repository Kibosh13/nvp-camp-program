<?php
declare(strict_types=1);
require __DIR__ . '/../private/bootstrap.php';

require_admin();
$action = (string)($_GET['action'] ?? 'config');

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'config') {
        json_response(['config' => read_site_config()]);
    }

    verify_csrf();

    if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $action === 'config') {
        $payload = request_json();
        $config = $payload['config'] ?? null;
        if (!is_array($config)) {
            json_response(['error' => 'В запросе отсутствует конфигурация.'], 400);
        }
        json_response(['config' => write_site_config($config), 'savedAt' => gmdate('c')]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'upload') {
        if (empty($_FILES['file']) || !is_array($_FILES['file'])) {
            json_response(['error' => 'Выберите изображение.'], 400);
        }
        json_response(handle_image_upload($_FILES['file']), 201);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'password') {
        $payload = request_json();
        $currentPassword = (string)($payload['currentPassword'] ?? '');
        $newPassword = (string)($payload['newPassword'] ?? '');
        change_admin_password($currentPassword, $newPassword);
        json_response(['ok' => true]);
    }

    json_response(['error' => 'Маршрут не найден.'], 404);
} catch (Throwable $error) {
    error_log('NVP admin API: ' . $error->getMessage());
    json_response(['error' => $error instanceof RuntimeException ? $error->getMessage() : 'Внутренняя ошибка сервера.'], 500);
}
