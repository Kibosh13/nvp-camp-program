# Beget CRM deployment

This directory contains the PHP version deployed to the existing Beget shared-hosting account.
It runs on PHP 8.1+ and does not require paid services or a database server.

Runtime-only files are intentionally excluded from Git:

- `public_html/private/settings.php` — administrator password hash;
- `public_html/private/data/site-config.json` and backups — content edited in the CRM;
- `public_html/uploads/**` — images uploaded through the CRM.

For a fresh installation, copy `public_html/private/settings.php.example` to
`public_html/private/settings.php`, replace the placeholder with a password hash produced by
PHP `password_hash`, and upload the contents of `public_html` to the site's document root.
The data directory is initialized automatically on the first request.
