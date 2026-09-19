document.documentElement.classList.add('js');

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.desktop-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  nav?.classList.toggle('is-open', !isOpen);
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const campCarousel = document.querySelector('.camp-carousel-window');

document.querySelectorAll('[data-carousel-direction]').forEach((button) => {
  button.addEventListener('click', () => {
    const direction = Number(button.dataset.carouselDirection) || 1;
    const distance = Math.max(280, campCarousel?.clientWidth * 0.78 || 0);
    campCarousel?.scrollBy({ left: direction * distance, behavior: 'smooth' });
  });
});
