"use client";

import { useEffect } from "react";
import type { SiteConfig } from "@/lib/site-config";

const programSymbols = ["⌖", "⊕", "✚", "⌁", "◇", "▰", "△", "◎", "↗", "≈", "◆", "◌"];
const galleryClasses = ["gallery-item-wide", "gallery-item-aiming", "gallery-item-lineup", "gallery-item-marching", "gallery-item-cadets", "gallery-item-team"];

export function PublicSite({ config }: { config: SiteConfig }) {
  useEffect(() => {
    document.documentElement.classList.add("js");
    const menuButton = document.querySelector<HTMLButtonElement>(".menu-toggle");
    const nav = document.querySelector<HTMLElement>(".desktop-nav");
    const closeMenu = () => {
      nav?.classList.remove("is-open");
      menuButton?.setAttribute("aria-expanded", "false");
    };
    const toggleMenu = () => {
      const open = nav?.classList.toggle("is-open") ?? false;
      menuButton?.setAttribute("aria-expanded", String(open));
    };
    menuButton?.addEventListener("click", toggleMenu);
    nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

    const revealItems = document.querySelectorAll<HTMLElement>(".reveal");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.08 },
    );
    revealItems.forEach((item) => observer.observe(item));

    const carousel = document.querySelector<HTMLElement>(".camp-carousel-window");
    const controls = document.querySelectorAll<HTMLButtonElement>("[data-carousel-direction]");
    const handlers = Array.from(controls).map((button) => {
      const handler = () => {
        const direction = Number(button.dataset.carouselDirection) || 1;
        const distance = Math.max(280, (carousel?.clientWidth ?? 0) * 0.78);
        carousel?.scrollBy({ left: direction * distance, behavior: "smooth" });
      };
      button.addEventListener("click", handler);
      return { button, handler };
    });

    return () => {
      menuButton?.removeEventListener("click", toggleMenu);
      nav?.querySelectorAll("a").forEach((link) => link.removeEventListener("click", closeMenu));
      handlers.forEach(({ button, handler }) => button.removeEventListener("click", handler));
      observer.disconnect();
      document.documentElement.classList.remove("js");
    };
  }, []);

  return (
    <div className="public-site">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="На главную">
          <img src={config.brand.logo.src} alt={config.brand.logo.alt} />
          <span>{config.brand.title}<br /><small>{config.brand.subtitle}</small></span>
        </a>
        <nav className="desktop-nav" aria-label="Основная навигация">
          {config.navigation.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
        </nav>
        <button className="menu-toggle" type="button" aria-label="Открыть меню" aria-expanded="false"><span /><span /></button>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span>01</span> {config.hero.eyebrow}</p>
            <h1 id="hero-title">{config.hero.title}<br /><em>{config.hero.accent}</em></h1>
            <p className="hero-lead">{config.hero.lead}</p>
          </div>
          <aside className="hero-showcase" aria-label="Фотографии участников программы">
            <figure className="hero-showcase-main">
              <img src={config.hero.primaryImage.src} alt={config.hero.primaryImage.alt} />
              <figcaption><span>{config.hero.photoLabel}</span><strong>{config.hero.photoCaption}</strong></figcaption>
            </figure>
            <figure className="hero-showcase-small"><img src={config.hero.secondaryImage.src} alt={config.hero.secondaryImage.alt} /></figure>
            <div className="hero-showcase-data"><b>{config.hero.statValue}</b><span>{config.hero.statLabel}</span></div>
          </aside>
          <div className="hero-footer"><span>{config.hero.footerLeft}</span><span className="scroll-note">{config.hero.footerRight}</span></div>
        </section>

        <section className="intro-strip" aria-label="Кратко о проекте">
          {config.intro.map((item, index) => <p key={index}>{item}</p>)}
        </section>

        <section className="section experience" id="experience">
          <div className="section-heading reveal">
            <p className="section-kicker">{config.experience.kicker}</p>
            <h2>{config.experience.title} <span>{config.experience.accent}</span></h2>
          </div>
          <div className="experience-grid">
            <div className="experience-copy reveal">
              <p className="lead-copy">{config.experience.lead}</p>
              <dl className="fact-list">{config.experience.facts.map((fact, index) => <div key={index}><dt>{fact.value}</dt><dd>{fact.label}</dd></div>)}</dl>
            </div>
            <div className="map-card reveal" aria-label="Карта географии проведённых смен по России">
              <div className="map-head"><span>{config.experience.mapTitle}</span><span>{config.experience.mapRegion}</span></div>
              <div className="map-visual">
                <img src={config.experience.mapImage.src} alt={config.experience.mapImage.alt} />
                {config.experience.points.map((point) => (
                  <span className={`map-pin${point.logo ? " map-pin-logo" : ""}`} style={{ "--x": `${point.x}%`, "--y": `${point.y}%` } as React.CSSProperties} title={point.label} key={point.id}>
                    {point.logo ? <img src={point.logo} alt="" /> : null}
                  </span>
                ))}
              </div>
              <p>{config.experience.mapDescription}</p>
            </div>
          </div>
        </section>

        <section className="section program" id="program">
          <div className="program-head reveal">
            <p className="section-kicker">{config.program.kicker}</p>
            <h2>{config.program.title}<br /><span>{config.program.accent}</span></h2>
            <p>{config.program.intro}</p>
          </div>
          <div className="program-grid">
            {config.program.cards.map((card, index) => (
              <article className="program-card reveal" key={index}>
                <div className="program-card-visual program-card-photo" style={{ "--card-image": `url('${card.image.src}')` } as React.CSSProperties}>
                  <span>{String(index + 1).padStart(2, "0")}</span><b aria-hidden="true">{programSymbols[index % programSymbols.length]}</b><small>{card.eyebrow}</small>
                </div>
                <div className="program-card-body"><h3>{card.title}</h3><p>{card.description}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="section team" id="team">
          <div className="team-layout">
            <div className="team-title reveal"><p className="section-kicker">{config.team.kicker}</p><h2>{config.team.title} <span>{config.team.accent}</span></h2></div>
            <div className="team-intro reveal"><p>{config.team.intro}</p></div>
          </div>
          <div className="roles-grid">
            {config.team.members.map((member, index) => (
              <article className="role-card reveal" key={index}>
                <div className={`role-photo${member.image.src ? " has-image" : ""}`}>
                  {member.image.src ? <img src={member.image.src} alt={member.image.alt} /> : <span>Фото сотрудника</span>}<b>{String(index + 1).padStart(2, "0")}</b>
                </div>
                <div className="role-card-body"><h3>{member.title}</h3><p>{member.description}</p></div>
              </article>
            ))}
          </div>
          <blockquote className="team-quote reveal">{config.team.quote}</blockquote>
        </section>

        <section className="section equipment" id="equipment">
          <div className="equipment-copy reveal"><p className="section-kicker">{config.equipment.kicker}</p><h2>{config.equipment.title} <span>{config.equipment.accent}</span></h2><p>{config.equipment.description}</p></div>
          <div className="equipment-board reveal" aria-label="Категории оснащения программы"><div className="equipment-word">МТО</div><ul>{config.equipment.items.map((item, index) => <li key={index}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ul></div>
        </section>

        <section className="section gallery" id="gallery">
          <div className="gallery-head reveal"><p className="section-kicker">{config.gallery.kicker}</p><h2>{config.gallery.title} <span>{config.gallery.accent}</span></h2></div>
          <div className="gallery-grid" aria-label="Фотографии реальной смены">
            {config.gallery.items.map((item, index) => <figure className={`gallery-item ${galleryClasses[index] ?? ""} reveal`} key={index}><img src={item.image.src} alt={item.image.alt} /><figcaption><span>{item.eyebrow}</span><b>{item.title}</b></figcaption></figure>)}
          </div>
          <p className="gallery-note reveal">{config.gallery.note}</p>
          <div className="camp-carousel reveal" aria-labelledby="camp-carousel-title">
            <div className="camp-carousel-head"><p className="section-kicker">{config.gallery.carouselKicker}</p><h3 id="camp-carousel-title">{config.gallery.carouselTitle}</h3><p>{config.gallery.carouselDescription}</p><div className="camp-carousel-controls" aria-label="Управление фотогалереей"><button className="carousel-button" type="button" data-carousel-direction="-1" aria-label="Предыдущие фотографии">←</button><button className="carousel-button" type="button" data-carousel-direction="1" aria-label="Следующие фотографии">→</button></div></div>
            <div className="camp-carousel-window"><div className="camp-carousel-track"><div className="camp-carousel-group">{config.gallery.carousel.map((item, index) => <figure key={index}><img src={item.image.src} alt={item.image.alt} loading="lazy" decoding="async" /><figcaption>{item.caption}</figcaption></figure>)}</div></div></div>
          </div>
        </section>

        <section className="closing" aria-labelledby="closing-title">
          <div className="closing-mark reveal"><img src={config.brand.logo.src} alt="" /></div>
          <div className="closing-copy reveal"><p className="section-kicker">{config.closing.kicker}</p><h2 id="closing-title">{config.closing.title} <span>{config.closing.accent}</span></h2><p>{config.closing.description}</p></div>
        </section>
      </main>

      <footer className="site-footer"><div className="brand"><img src={config.brand.logo.src} alt="" /><span>{config.brand.title}<br /><small>{config.brand.subtitle}</small></span></div><p>{config.footer.tagline}</p><p>{config.footer.copyright}</p></footer>
    </div>
  );
}
