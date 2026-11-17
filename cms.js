(() => {
  const endpoint = window.CITRINE_CMS_API;
  if (!endpoint) return;
  const esc = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const link = item => esc(item.url || '#contact');
  const normalized = value => String(value || '').replace(/\s+/g, ' ').trim().toLocaleLowerCase();
  const mergeItems = (container, selector, items, titleOf, render) => {
    if (!container || !items.length) return;
    items.forEach((item, index) => {
      const title = normalized(titleOf(item));
      const match = [...container.children].find(child => normalized(child.querySelector(selector)?.textContent) === title);
      const wrapper = document.createElement('div');
      wrapper.innerHTML = render(item, index).trim();
      const replacement = wrapper.firstElementChild;
      if (!replacement) return;
      if (match) match.replaceWith(replacement);
      else container.appendChild(replacement);
    });
  };
  const load = async () => {
    try {
      const response = await fetch(endpoint, { cache: 'no-store', headers: { Accept: 'application/json' } });
      if (!response.ok) return;
      const result = await response.json();
      const content = result.content || {};
      const services = content.service || [];
      mergeItems(document.querySelector('.service-grid'), 'h3', services, item => item.title, (item, i) => `<a class="service-card${i === 1 ? ' service-card-accent' : ''}" href="${link(item)}"><span class="card-index">${esc(item.eyebrow || String(i + 1).padStart(2, '0'))}</span><h3>${esc(item.title)}</h3><p>${esc(item.excerpt)}</p><span class="card-link">${esc(item.linkLabel || 'Explore more')} <b>↗</b></span></a>`);
      const programmes = content.programme || [];
      mergeItems(document.querySelector('.programme-list'), 'strong', programmes, item => item.title, (item, i) => `<a href="${link(item)}" class="programme-row"><span>${String(i + 1).padStart(2, '0')}</span><strong>${esc(item.title)}</strong><b aria-hidden="true">↗</b></a>`);
      const books = content.book || [];
      mergeItems(document.querySelector('.book-grid'), 'h4', books, item => item.title, (item, i) => `<article class="book-card"><span class="book-mark">${String(i + 1).padStart(2, '0')}</span><div><p class="content-type">${esc(item.eyebrow || 'BOOK')}</p><h4>${esc(item.title)}</h4><p>${esc(item.excerpt)}</p><a href="${link(item)}" class="text-link">${esc(item.linkLabel || 'Learn more')} <span>↗</span></a></div></article>`);
      const initiatives = content.initiative || [];
      mergeItems(document.querySelector('.impact-cards'), 'h3', initiatives, item => item.title, (item, i) => `<article><span>${esc(item.eyebrow || String(i + 1).padStart(2, '0'))}</span><h3>${esc(item.title)}</h3><p>${esc(item.excerpt)}</p><a href="${link(item)}">${esc(item.linkLabel || 'Explore collaboration')} <b>↗</b></a></article>`);
      const people = content.person || [];
      if (people.length) {
        mergeItems(document.querySelector('.people-grid'), 'h4', people, item => item.title, item => `<article class="person-card">${item.image ? `<img class="person-thumb" src="${esc(item.image)}" alt="${esc(item.imageAlt || item.title)}">` : ''}<div><h4>${esc(item.title)}</h4><p>${esc(item.role || item.eyebrow || '')}</p></div></article>`);
        const teamBlock = document.querySelector('.team-block');
        people.forEach((item, i) => {
          const portfolio = item.portfolio.map((line, index) => {
            const [heading, detail] = line.split('|').map(value => value.trim());
            return `<li><span>${String(index + 1).padStart(2, '0')}</span><div><strong>${esc(heading || line)}</strong>${detail ? `<small>${esc(detail)}</small>` : ''}</div></li>`;
          }).join('');
          const article = document.createElement('article');
          article.className = `founder-profile${i % 2 ? ' redza-profile' : ' ivlynn-profile'}`;
          article.innerHTML = `${item.image ? `<figure class="founder-portrait"><div class="portrait-frame"><img src="${esc(item.image)}" alt="${esc(item.imageAlt || item.title)}"></div></figure>` : ''}<div class="founder-copy"><p class="eyebrow">${esc(item.eyebrow || 'Leadership')}</p><h3>${esc(item.title)}</h3><p class="founder-role">${esc(item.role || '')}</p><p>${esc(item.excerpt)}</p>${portfolio ? `<div class="portfolio-label">Selected experience &amp; portfolio</div><ul class="career-list">${portfolio}</ul>` : ''}${item.url ? `<a class="text-link" href="${link(item)}">${esc(item.linkLabel || 'More about ' + item.title)} <span>↗</span></a>` : ''}</div>`;
          const existing = [...teamBlock.querySelectorAll(':scope > .founder-profile')].find(profile => normalized(profile.querySelector('h3')?.textContent) === normalized(item.title));
          if (existing) existing.replaceWith(article); else teamBlock.appendChild(article);
        });
      }
      const insights = content.insight || [];
      mergeItems(document.querySelector('.insight-grid'), 'h3', insights, item => item.title, (item, i) => `<article class="insight-card${i === 0 ? ' insight-feature' : ''}"><div class="insight-card-top"><span class="content-type">${esc(item.eyebrow || 'INSIGHT')}</span><span class="insight-symbol" aria-hidden="true">${esc(item.title.slice(0, 2))}</span></div><h3>${esc(item.title)}</h3><p>${esc(item.excerpt)}</p>${item.url ? `<a href="${link(item)}" class="text-link">${esc(item.linkLabel || 'Read more')} <span>↗</span></a>` : ''}</article>`);
      const partners = content.partner || [];
      if (partners.length) {
        const strip = document.querySelector('.partner-strip');
        const paragraph = strip.querySelector('p');
        const current = (paragraph?.textContent || '').split('·').map(value => value.trim()).filter(Boolean);
        const merged = [...new Set([...current, ...partners.map(item => item.title)])];
        strip.innerHTML = `<span class="partner-label">Collaborators</span><p>${merged.map(esc).join(' · ')}</p>`;
      }
      document.documentElement.dataset.citrineCms = 'connected';
    } catch (_) {
      // The original Citrine page remains usable while WordPress is offline or has no published items.
    }
  };
  load();
})();
