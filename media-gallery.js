(() => {
  const gallery = document.querySelector('[data-gallery]');
  if (!gallery) return;

  const image = gallery.querySelector('[data-gallery-image]');
  const caption = gallery.querySelector('[data-gallery-caption]');
  const count = gallery.querySelector('[data-gallery-count]');
  const slides = [...gallery.querySelectorAll('[data-gallery-slide]')];
  if (!image || !slides.length) return;

  let active = 0;
  const show = index => {
    active = (index + slides.length) % slides.length;
    const slide = slides[active];
    image.src = slide.dataset.src;
    image.alt = slide.dataset.alt || '';
    if (caption) caption.textContent = slide.dataset.caption || '';
    if (count) count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    slides.forEach((button, i) => {
      const selected = i === active;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  };

  slides.forEach((slide, index) => slide.addEventListener('click', () => show(index)));
  gallery.querySelector('[data-gallery-prev]')?.addEventListener('click', () => show(active - 1));
  gallery.querySelector('[data-gallery-next]')?.addEventListener('click', () => show(active + 1));

  let startX = 0;
  let startY = 0;
  const photo = gallery.querySelector('.case-gallery-main');
  photo?.addEventListener('touchstart', event => {
    startX = event.changedTouches[0].clientX;
    startY = event.changedTouches[0].clientY;
  }, { passive: true });
  photo?.addEventListener('touchend', event => {
    const deltaX = event.changedTouches[0].clientX - startX;
    const deltaY = event.changedTouches[0].clientY - startY;
    if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) show(active + (deltaX < 0 ? 1 : -1));
  }, { passive: true });
})();
