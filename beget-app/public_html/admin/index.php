<?php
declare(strict_types=1);
require __DIR__ . '/../private/bootstrap.php';

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    $attempts = (int)($_SESSION['login_attempts'] ?? 0);
    $blockedUntil = (int)($_SESSION['login_blocked_until'] ?? 0);
    if ($blockedUntil > time()) {
        $error = 'Слишком много попыток. Повторите вход через несколько минут.';
    } elseif (!hash_equals(csrf_token(), (string)($_POST['csrf_token'] ?? ''))) {
        $error = 'Сессия устарела. Обновите страницу.';
    } else {
        $settings = app_settings();
        $userOk = hash_equals((string)$settings['admin_user'], (string)($_POST['username'] ?? ''));
        $passwordOk = password_verify((string)($_POST['password'] ?? ''), (string)$settings['admin_password_hash']);
        if ($userOk && $passwordOk) {
            session_regenerate_id(true);
            $_SESSION['nvp_admin'] = true;
            $_SESSION['login_attempts'] = 0;
            $_SESSION['csrf_token'] = bin2hex(random_bytes(24));
            header('Location: /admin/');
            exit;
        }
        $attempts++;
        $_SESSION['login_attempts'] = $attempts;
        if ($attempts >= 7) {
            $_SESSION['login_blocked_until'] = time() + 300;
        }
        usleep(350000);
        $error = 'Неверный логин или пароль.';
    }
}

if (isset($_GET['logout']) && is_admin()) {
    if (hash_equals(csrf_token(), (string)($_GET['token'] ?? ''))) {
        $_SESSION = [];
        session_destroy();
    }
    header('Location: /admin/');
    exit;
}

header('X-Robots-Tag: noindex, nofollow, noarchive');
header("Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <title>Управление сайтом — НВП</title>
  <link rel="stylesheet" href="/admin/styles.css?v=1">
</head>
<body>
<?php if (!is_admin()): ?>
  <main class="login-shell">
    <form class="login-card" method="post" autocomplete="on">
      <img src="/assets/logo-transparent.png" alt="Эмблема НВП">
      <p class="overline">Панель управления</p>
      <h1>Вход в CRM</h1>
      <p>Редактирование сайта доступно только администратору.</p>
      <?php if ($error): ?><div class="notice error" role="alert"><?= h($error) ?></div><?php endif; ?>
      <label>Логин<input name="username" autocomplete="username" required autofocus></label>
      <label>Пароль<input type="password" name="password" autocomplete="current-password" required></label>
      <input type="hidden" name="csrf_token" value="<?= h(csrf_token()) ?>">
      <button class="primary" type="submit" name="login" value="1">Войти</button>
    </form>
  </main>
<?php else: ?>
  <header class="admin-header">
    <div><p class="overline">CRM / НВП для детских лагерей</p><h1>Управление сайтом</h1></div>
    <div class="header-actions"><a class="button ghost" href="/" target="_blank" rel="noopener">Открыть сайт ↗</a><button class="button primary" id="save-button" type="button">Сохранить</button><a class="button ghost" href="/admin/?logout=1&amp;token=<?= h(csrf_token()) ?>">Выйти</a></div>
  </header>
  <div class="admin-layout">
    <nav class="admin-nav" aria-label="Разделы CRM" id="admin-nav"></nav>
    <main class="admin-main"><div class="notice" id="status" aria-live="polite">Изменения применятся на сайте после сохранения.</div><div id="editor"></div></main>
  </div>
  <script>window.NVP_ADMIN={csrf:<?= json_encode(csrf_token()) ?>,config:<?= json_encode(read_site_config(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>};</script>
  <script src="/admin/admin.js?v=3" defer></script>
<?php endif; ?>
</body>
</html>
