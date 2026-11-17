(() => {
  const selector = '#top h1, #about-title, #services-title, #stories-title, #programmes-title, #insights-title, #impact-title, #contact-title';
  const titles = Array.from(document.querySelectorAll(selector));
  if (!titles.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let frame = 0;
  const update = () => {
    frame = 0;
    const height = window.innerHeight || 1;
    const center = height / 2;
    const range = height * 0.62;
    const smallScreen = window.matchMedia('(max-width: 680px)').matches;
    const minScale = smallScreen ? 0.96 : 0.90;
    const maxScale = smallScreen ? 1.05 : 1.10;

    titles.forEach(title => {
      const rect = title.getBoundingClientRect();
      const titleCenter = rect.top + rect.height / 2;
      const focus = Math.max(0, 1 - Math.abs(titleCenter - center) / range);
      const scale = minScale + (maxScale - minScale) * focus;
      title.style.setProperty('--scroll-title-scale', scale.toFixed(3));
      title.style.setProperty('--scroll-title-opacity', (0.9 + focus * 0.1).toFixed(3));
    });
  };
  const requestUpdate = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  requestUpdate();
})();
