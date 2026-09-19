<?php
declare(strict_types=1);
require __DIR__ . '/private/bootstrap.php';
header('Content-Type: text/plain; charset=utf-8');
$config = read_site_config();
$blocked = !empty($config['seo']['noIndex']);
echo "User-agent: *\n";
echo $blocked ? "Disallow: /\n" : "Allow: /\n";
