<?php
declare(strict_types=1);
require __DIR__ . '/private/bootstrap.php';

$site = read_site_config();
$seo = $site['seo'];
$brand = $site['brand'];
$hero = $site['hero'];
$experience = $site['experience'];
$program = $site['program'];
$team = $site['team'];
$equipment = $site['equipment'];
$gallery = $site['gallery'];
$closing = $site['closing'];
$footer = $site['footer'];
$galleryClasses = ['gallery-item-wide', 'gallery-item-aiming', 'gallery-item-lineup', 'gallery-item-marching', 'gallery-item-cadets', 'gallery-item-team'];
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="<?= h($seo['description']) ?>">
  <?php if (!empty($seo['noIndex'])): ?><meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex"><?php endif; ?>
  <meta name="theme-color" content="#f5f4f0">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="<?= h($brand['title']) ?>">
  <meta property="og:title" content="<?= h($seo['title']) ?>">
  <meta property="og:description" content="<?= h($seo['description']) ?>">
  <meta property="og:url" content="https://kmbnvp.ru/">
  <meta property="og:image" content="https://kmbnvp.ru/assets/logo-transparent.png?v=4">
  <meta property="og:image:secure_url" content="https://kmbnvp.ru/assets/logo-transparent.png?v=4">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="632">
  <meta property="og:image:height" content="576">
  <meta property="og:image:alt" content="Логотип проекта НВП для детских лагерей">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="<?= h($seo['title']) ?>">
  <meta name="twitter:description" content="<?= h($seo['description']) ?>">
  <meta name="twitter:image" content="https://kmbnvp.ru/assets/logo-transparent.png?v=4">
  <title><?= h($seo['title']) ?></title>
  <link rel="icon" type="image/png" href="<?= h(public_image_url((string)$brand['logo']['src'])) ?>">
  <link rel="apple-touch-icon" href="/assets/logo-transparent.png?v=4">
  <link rel="stylesheet" href="/styles.css?v=7">
  <script src="/app.js?v=2" defer></script>
</head>
<body>
  <header class="site-header">
    <a class="brand" href="#top" aria-label="На главную">
      <img src="<?= h(public_image_url((string)$brand['logo']['src'])) ?>" alt="<?= h($brand['logo']['alt']) ?>">
      <span><?= h($brand['title']) ?><br><small><?= h($brand['subtitle']) ?></small></span>
    </a>
    <nav class="desktop-nav" aria-label="Основная навигация">
      <?php if (!empty($closing['phone']) || !empty($closing['email'])): ?><div class="header-contacts" aria-label="Контакты"><?php if (!empty($closing['phone'])): ?><a href="tel:<?= h((string)preg_replace('/[^+\d]/', '', (string)$closing['phone'])) ?>"><span>Тел.</span><b><?= h($closing['phone']) ?></b></a><?php endif; ?><?php if (!empty($closing['email'])): ?><a href="mailto:<?= h($closing['email']) ?>"><span>Почта</span><b><?= h($closing['email']) ?></b></a><?php endif; ?></div><?php endif; ?>
      <?php foreach ($site['navigation'] as $item): ?><a href="<?= h($item['href']) ?>"><?= h($item['label']) ?></a><?php endforeach; ?>
    </nav>
    <button class="menu-toggle" type="button" aria-label="Открыть меню" aria-expanded="false"><span></span><span></span></button>
  </header>

  <main id="top">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="eyebrow"><span>01</span> <?= h($hero['eyebrow']) ?></p>
        <h1 id="hero-title"><?= h($hero['title']) ?><br><em><?= h($hero['accent']) ?></em></h1>
        <p class="hero-lead"><?= h($hero['lead']) ?></p>
      </div>
      <aside class="hero-showcase" aria-label="Фотографии участников программы">
        <figure class="hero-showcase-main">
          <img src="<?= h(public_image_url((string)$hero['primaryImage']['src'])) ?>" alt="<?= h($hero['primaryImage']['alt']) ?>">
          <figcaption><span><?= h($hero['photoLabel']) ?></span><strong><?= h($hero['photoCaption']) ?></strong></figcaption>
        </figure>
        <figure class="hero-showcase-small"><img src="<?= h(public_image_url((string)$hero['secondaryImage']['src'])) ?>" alt="<?= h($hero['secondaryImage']['alt']) ?>"></figure>
        <div class="hero-showcase-data" aria-label="Логотип проекта"><img src="<?= h(public_image_url((string)$brand['logo']['src'])) ?>" alt=""></div>
      </aside>
      <div class="hero-footer"><span><?= h($hero['footerLeft']) ?></span><span class="scroll-note"><?= h($hero['footerRight']) ?></span></div>
    </section>

    <section class="intro-strip" aria-label="Кратко о проекте">
      <?php foreach ($site['intro'] as $item): ?><p><?= h($item) ?></p><?php endforeach; ?>
    </section>

    <section class="section experience" id="experience">
      <div class="section-heading reveal"><p class="section-kicker"><?= h($experience['kicker']) ?></p><h2><?= h($experience['title']) ?> <span><?= h($experience['accent']) ?></span></h2></div>
      <div class="experience-grid">
        <div class="experience-copy reveal">
          <p class="lead-copy"><?= h($experience['lead']) ?></p>
          <dl class="fact-list"><?php foreach ($experience['facts'] as $fact): ?><div><dt><?= h($fact['value']) ?></dt><dd><?= h($fact['label']) ?></dd></div><?php endforeach; ?></dl>
        </div>
        <div class="map-card reveal" aria-label="Карта географии проведённых смен по России">
          <div class="map-head"><span><?= h($experience['mapTitle']) ?></span><span><?= h($experience['mapRegion']) ?></span></div>
          <div class="map-visual">
            <img src="<?= h(public_image_url((string)$experience['mapImage']['src'])) ?>" alt="<?= h($experience['mapImage']['alt']) ?>">
            <?php foreach ($experience['points'] as $point):
              $logo = public_image_url((string)($point['logo'] ?? ''));
              $x = max(0, min(100, (float)($point['x'] ?? 50)));
              $y = max(0, min(100, (float)($point['y'] ?? 50)));
            ?><span class="map-pin<?= $logo ? ' map-pin-logo' : '' ?>" title="<?= h($point['label']) ?>" style="--x:<?= h($x) ?>%;--y:<?= h($y) ?>%"><?php if ($logo): ?><img src="<?= h($logo) ?>" alt="<?= h($point['label']) ?>"><?php endif; ?></span><?php endforeach; ?>
          </div>
          <p><?= h($experience['mapDescription']) ?></p>
        </div>
      </div>
    </section>

    <section class="section program" id="program">
      <div class="program-head reveal"><p class="section-kicker"><?= h($program['kicker']) ?></p><h2><?= h($program['title']) ?><br><span><?= h($program['accent']) ?></span></h2><p><?= h($program['intro']) ?></p></div>
      <div class="program-grid">
        <?php foreach ($program['cards'] as $index => $card): $image = public_image_url((string)$card['image']['src']); ?>
        <article class="program-card reveal">
          <div class="program-card-visual program-card-photo" style="--card-image:url('<?= h($image) ?>')"><span><?= h(str_pad((string)($index + 1), 2, '0', STR_PAD_LEFT)) ?></span><small><?= h($card['eyebrow']) ?></small></div>
          <div class="program-card-body"><h3><?= h($card['title']) ?></h3><p><?= h($card['description']) ?></p></div>
        </article>
        <?php endforeach; ?>
      </div>
    </section>

    <section class="section team" id="team">
      <div class="team-layout">
        <div class="team-title reveal"><p class="section-kicker"><?= h($team['kicker']) ?></p><h2><?= h($team['title']) ?> <span><?= h($team['accent']) ?></span></h2></div>
        <div class="team-intro reveal"><p><?= h($team['intro']) ?></p></div>
      </div>
      <div class="roles-grid">
        <?php foreach ($team['members'] as $index => $member): $image = public_image_url((string)$member['image']['src']); ?>
        <article class="role-card reveal">
          <div class="role-photo<?= $image ? ' has-image' : '' ?>"><?php if ($image): ?><img src="<?= h($image) ?>" alt="<?= h($member['image']['alt']) ?>" loading="lazy"><?php else: ?><span>Фото сотрудника</span><?php endif; ?><b><?= h(str_pad((string)($index + 1), 2, '0', STR_PAD_LEFT)) ?></b></div>
          <div class="role-card-body"><h3><?= h($member['title']) ?></h3><?php if (!empty($member['credentials'])): ?><p class="role-credentials"><?= h($member['credentials']) ?></p><?php endif; ?><p><?= h($member['description']) ?></p></div>
        </article>
        <?php endforeach; ?>
      </div>
      <blockquote class="team-quote reveal"><?= h($team['quote']) ?></blockquote>
    </section>

    <section class="section equipment" id="equipment">
      <div class="equipment-copy reveal"><p class="section-kicker"><?= h($equipment['kicker']) ?></p><h2><?= h($equipment['title']) ?> <span><?= h($equipment['accent']) ?></span></h2><p><?= h($equipment['description']) ?></p></div>
      <div class="equipment-board reveal" aria-label="Категории оснащения программы"><div class="equipment-word">МТО</div><ul><?php foreach ($equipment['items'] as $index => $item): ?><li><span><?= h(str_pad((string)($index + 1), 2, '0', STR_PAD_LEFT)) ?></span> <?= h($item) ?></li><?php endforeach; ?></ul></div>
    </section>

    <section class="section gallery" id="gallery">
      <div class="gallery-head reveal"><p class="section-kicker"><?= h($gallery['kicker']) ?></p><h2><?= h($gallery['title']) ?> <span><?= h($gallery['accent']) ?></span></h2></div>
      <div class="gallery-grid" aria-label="Фотографии смены">
        <?php foreach ($gallery['items'] as $index => $item): $image = public_image_url((string)$item['image']['src']); ?>
        <figure class="gallery-item <?= h($galleryClasses[$index % count($galleryClasses)]) ?> reveal"><img src="<?= h($image) ?>" alt="<?= h($item['image']['alt']) ?>" loading="lazy"><figcaption><span><?= h($item['eyebrow']) ?></span><b><?= h($item['title']) ?></b></figcaption></figure>
        <?php endforeach; ?>
      </div>
      <p class="gallery-note reveal"><?= h($gallery['note']) ?></p>
      <div class="camp-carousel reveal" aria-labelledby="camp-carousel-title">
        <div class="camp-carousel-head">
          <p class="section-kicker"><?= h($gallery['carouselKicker']) ?></p>
          <h3 id="camp-carousel-title"><?= h($gallery['carouselTitle']) ?></h3>
          <p><?= h($gallery['carouselDescription']) ?></p>
        </div>
        <div class="camp-carousel-window"><div class="camp-carousel-track"><div class="camp-carousel-group">
          <?php foreach ($gallery['carousel'] as $item): $image = public_image_url((string)$item['image']['src']); ?><figure><img src="<?= h($image) ?>" alt="<?= h($item['image']['alt']) ?>" loading="lazy" decoding="async"><figcaption><?= h($item['caption']) ?></figcaption></figure><?php endforeach; ?>
        </div></div></div>
      </div>
    </section>

    <section class="closing" aria-labelledby="closing-title">
      <div class="closing-mark reveal"><img src="<?= h(public_image_url((string)$brand['logo']['src'])) ?>" alt=""></div>
      <div class="closing-copy reveal"><p class="section-kicker"><?= h($closing['kicker']) ?></p><h2 id="closing-title"><?= h($closing['title']) ?> <span><?= h($closing['accent']) ?></span></h2><p><?= h($closing['description']) ?></p><?php if (!empty($closing['phone']) || !empty($closing['email'])): ?><div class="contact-actions"><?php if (!empty($closing['phone'])): ?><a href="tel:<?= h((string)preg_replace('/[^+\d]/', '', (string)$closing['phone'])) ?>"><span>Телефон</span><b><?= h($closing['phone']) ?></b></a><?php endif; ?><?php if (!empty($closing['email'])): ?><a href="mailto:<?= h($closing['email']) ?>"><span>Почта</span><b><?= h($closing['email']) ?></b></a><?php endif; ?></div><?php endif; ?></div>
    </section>
  </main>

  <footer class="site-footer"><div class="brand"><img src="<?= h(public_image_url((string)$brand['logo']['src'])) ?>" alt=""><span><?= h($brand['title']) ?><br><small><?= h($brand['subtitle']) ?></small></span></div><p><?= h($footer['tagline']) ?></p><p><?= h($footer['copyright']) ?></p></footer>
</body>
</html>
