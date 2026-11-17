(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const observed = new WeakSet();
  const numberFormat = new Intl.NumberFormat('en');

  const setupCounter = stat => {
    if (observed.has(stat)) return;
    const number = stat.querySelector('strong');
    if (!number) return;

    const finalText = number.textContent.trim();
    const parts = finalText.match(/^(\D*)([\d,]+)(\D*)$/);
    if (!parts) return;

    observed.add(stat);
    const prefix = parts[1];
    const target = Number(parts[2].replace(/,/g, ''));
    const suffix = parts[3];
    const format = value => `${prefix}${numberFormat.format(value)}${suffix}`;
    number.setAttribute('aria-label', finalText);

    if (reducedMotion || !('IntersectionObserver' in window)) {
      number.textContent = finalText;
      return;
    }

    number.textContent = format(0);
    const counter = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      counter.disconnect();
      const start = performance.now();
      const duration = 780;
      const tick = now => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        number.textContent = format(Math.floor(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
        else number.textContent = finalText;
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.55 });
    counter.observe(stat);
  };

  const setupAll = root => {
    if (root.matches?.('.portfolio-stat')) setupCounter(root);
    root.querySelectorAll?.('.portfolio-stat').forEach(setupCounter);
  };

  setupAll(document);
  new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(setupAll));
  }).observe(document.body, { childList: true, subtree: true });
})();
