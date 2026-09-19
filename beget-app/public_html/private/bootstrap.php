<?php
declare(strict_types=1);

const APP_ROOT = __DIR__ . '/..';
const DATA_ROOT = __DIR__ . '/data';
const UPLOAD_ROOT = APP_ROOT . '/uploads';
const MAX_CONFIG_BYTES = 2_000_000;
const MAX_UPLOAD_BYTES = 15_728_640;

if (!is_dir(DATA_ROOT)) {
    mkdir(DATA_ROOT, 0750, true);
}
if (!is_dir(UPLOAD_ROOT)) {
    mkdir(UPLOAD_ROOT, 0755, true);
}

if (session_status() !== PHP_SESSION_ACTIVE) {
    $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_name('nvp_admin_session');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function app_settings(): array
{
    static $settings;
    if (is_array($settings)) {
        return $settings;
    }
    $path = __DIR__ . '/settings.php';
    if (!is_file($path)) {
        http_response_code(503);
        exit('Приложение ещё не настроено.');
    }
    clearstatcache(true, $path);
    if (function_exists('opcache_invalidate')) {
        @opcache_invalidate($path, true);
    }
    $loaded = require $path;
    if (!is_array($loaded) || empty($loaded['admin_user']) || empty($loaded['admin_password_hash'])) {
        http_response_code(503);
        exit('Некорректная конфигурация приложения.');
    }
    $settings = $loaded;
    return $settings;
}

function read_json_file(string $path): array
{
    if (!is_file($path)) {
        return [];
    }
    $handle = fopen($path, 'rb');
    if (!$handle) {
        return [];
    }
    flock($handle, LOCK_SH);
    $payload = stream_get_contents($handle) ?: '';
    flock($handle, LOCK_UN);
    fclose($handle);
    $decoded = json_decode($payload, true);
    return is_array($decoded) ? $decoded : [];
}

function default_config(): array
{
    return read_json_file(__DIR__ . '/default-config.json');
}

function merge_config(array $defaults, array $saved): array
{
    foreach ($saved as $key => $value) {
        if (array_key_exists($key, $defaults) && is_array($defaults[$key]) && is_array($value)) {
            $isList = array_is_list($defaults[$key]);
            $defaults[$key] = $isList ? $value : merge_config($defaults[$key], $value);
        } else {
            $defaults[$key] = $value;
        }
    }
    return $defaults;
}

function read_site_config(): array
{
    $defaults = default_config();
    $saved = read_json_file(DATA_ROOT . '/site-config.json');
    return merge_config($defaults, $saved);
}

function clean_config_value(mixed $value, int $depth = 0): mixed
{
    if ($depth > 20) {
        throw new RuntimeException('Слишком глубокая структура данных.');
    }
    if (is_string($value)) {
        return mb_substr(str_replace("\0", '', $value), 0, 20000);
    }
    if (is_bool($value) || is_int($value) || is_float($value) || $value === null) {
        return $value;
    }
    if (!is_array($value)) {
        return null;
    }
    if (count($value) > 250) {
        throw new RuntimeException('Слишком много элементов в одном разделе.');
    }
    $result = [];
    foreach ($value as $key => $item) {
        $safeKey = is_int($key) ? $key : mb_substr((string)$key, 0, 100);
        $result[$safeKey] = clean_config_value($item, $depth + 1);
    }
    return $result;
}

function write_site_config(array $config): array
{
    $clean = clean_config_value($config);
    if (!is_array($clean)) {
        throw new RuntimeException('Некорректные данные.');
    }
    $normalized = merge_config(default_config(), $clean);
    $json = json_encode($normalized, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($json === false || strlen($json) > MAX_CONFIG_BYTES) {
        throw new RuntimeException('Конфигурация слишком большая.');
    }

    $path = DATA_ROOT . '/site-config.json';
    $backupDir = DATA_ROOT . '/backups';
    if (is_file($path)) {
        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0750, true);
        }
        copy($path, $backupDir . '/site-config-' . date('Ymd-His') . '.json');
        $backups = glob($backupDir . '/site-config-*.json') ?: [];
        rsort($backups);
        foreach (array_slice($backups, 20) as $oldBackup) {
            @unlink($oldBackup);
        }
    }

    $temporary = $path . '.tmp-' . bin2hex(random_bytes(5));
    if (file_put_contents($temporary, $json . "\n", LOCK_EX) === false) {
        throw new RuntimeException('Не удалось записать изменения.');
    }
    chmod($temporary, 0640);
    if (!rename($temporary, $path)) {
        @unlink($temporary);
        throw new RuntimeException('Не удалось применить изменения.');
    }
    return $normalized;
}

function is_admin(): bool
{
    return !empty($_SESSION['nvp_admin']) && $_SESSION['nvp_admin'] === true;
}

function require_admin(): void
{
    if (!is_admin()) {
        json_response(['error' => 'Требуется вход в панель управления.'], 401);
    }
}

function change_admin_password(string $currentPassword, string $newPassword): void
{
    $settings = app_settings();
    if (!password_verify($currentPassword, (string)$settings['admin_password_hash'])) {
        throw new RuntimeException('Текущий пароль указан неверно.');
    }
    if (mb_strlen($newPassword) < 12) {
        throw new RuntimeException('Новый пароль должен содержать не меньше 12 символов.');
    }
    if (hash_equals($currentPassword, $newPassword)) {
        throw new RuntimeException('Новый пароль должен отличаться от текущего.');
    }
    $hash = password_hash($newPassword, PASSWORD_DEFAULT);
    if (!is_string($hash)) {
        throw new RuntimeException('Не удалось подготовить новый пароль.');
    }
    $contents = "<?php\nreturn [\n"
        . "    'admin_user' => " . var_export((string)$settings['admin_user'], true) . ",\n"
        . "    'admin_password_hash' => " . var_export($hash, true) . ",\n"
        . "];\n";
    $path = __DIR__ . '/settings.php';
    $temporary = $path . '.tmp-' . bin2hex(random_bytes(5));
    if (file_put_contents($temporary, $contents, LOCK_EX) === false) {
        throw new RuntimeException('Не удалось обновить пароль.');
    }
    chmod($temporary, 0600);
    if (!rename($temporary, $path)) {
        @unlink($temporary);
        throw new RuntimeException('Не удалось применить новый пароль.');
    }
    clearstatcache(true, $path);
    if (function_exists('opcache_invalidate')) {
        @opcache_invalidate($path, true);
    }
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(24));
    }
    return (string)$_SESSION['csrf_token'];
}

function verify_csrf(): void
{
    $provided = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? ($_POST['csrf_token'] ?? '');
    if (!is_string($provided) || !hash_equals(csrf_token(), $provided)) {
        json_response(['error' => 'Сессия устарела. Обновите страницу и повторите действие.'], 419);
    }
}

function json_response(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function request_json(): array
{
    $length = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($length > MAX_CONFIG_BYTES + 10000) {
        json_response(['error' => 'Запрос слишком большой.'], 413);
    }
    $decoded = json_decode(file_get_contents('php://input') ?: '', true);
    if (!is_array($decoded)) {
        json_response(['error' => 'Некорректный JSON.'], 400);
    }
    return $decoded;
}

function public_image_url(string $value): string
{
    if ($value === '') {
        return '';
    }
    if (str_starts_with($value, '/assets/') || str_starts_with($value, '/uploads/')) {
        return $value;
    }
    return '';
}

function handle_image_upload(array $file): array
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Файл не был загружен.');
    }
    $size = (int)($file['size'] ?? 0);
    if ($size < 1 || $size > MAX_UPLOAD_BYTES) {
        throw new RuntimeException('Размер изображения должен быть не больше 15 МБ.');
    }
    $temporary = (string)($file['tmp_name'] ?? '');
    if (!is_uploaded_file($temporary)) {
        throw new RuntimeException('Некорректный файл загрузки.');
    }
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($temporary) ?: '';
    $types = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];
    if (!isset($types[$mime]) || @getimagesize($temporary) === false) {
        throw new RuntimeException('Разрешены только JPEG, PNG, WEBP и GIF.');
    }
    $month = date('Y-m');
    $directory = UPLOAD_ROOT . '/' . $month;
    if (!is_dir($directory) && !mkdir($directory, 0755, true)) {
        throw new RuntimeException('Не удалось создать папку загрузок.');
    }
    $name = bin2hex(random_bytes(16)) . '.' . $types[$mime];
    $destination = $directory . '/' . $name;
    if (!move_uploaded_file($temporary, $destination)) {
        throw new RuntimeException('Не удалось сохранить изображение.');
    }
    chmod($destination, 0644);
    return [
        'url' => '/uploads/' . $month . '/' . $name,
        'name' => mb_substr((string)($file['name'] ?? $name), 0, 200),
    ];
}

function h(mixed $value): string
{
    return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function cfg(array $source, string ...$path): mixed
{
    $cursor = $source;
    foreach ($path as $key) {
        if (!is_array($cursor) || !array_key_exists($key, $cursor)) {
            return '';
        }
        $cursor = $cursor[$key];
    }
    return $cursor;
}
