(() => {
  const CONTENT_URL = new URL('https://raw.githubusercontent.com/liviltechsolutions/citrineoneweb/main/data/homepage.json');
  CONTENT_URL.searchParams.set('v', String(Date.now()));
  const REPOSITORY_RAW = 'https://raw.githubusercontent.com/liviltechsolutions/citrineoneweb/main/';
  const text = (selector, value, root = document) => {
    const node = root.querySelector(selector);
    if (node && value !== undefined && value !== null) node.textContent = value;
    return node;
  };
  const safeUrl = (value, fallback = '#contact') => {
    const raw = String(value || '').trim();
    if (!raw) return fallback;
    if (raw.startsWith('#')) return raw;
    try {
      const parsed = new URL(raw, document.baseURI);
      return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol) ? parsed.href : fallback;
    } catch (_) { return fallback; }
  };
  const imageUrl = value => {
    const path = String(value || '').replace(/^\.\//, '').replace(/^\/+/, '');
    if (path.startsWith('assets/')) return `${REPOSITORY_RAW}${path}?v=${Date.now()}`;
    return safeUrl(value, '');
  };
  const setImage = (img, src, alt) => {
    if (!img || !src) return;
    img.src = imageUrl(src);
    if (alt !== undefined) img.alt = alt;
  };
  const setHeading = (node, lead, emphasis, middle = '') => {
    if (!node) return;
    const br = document.createElement('br');
    const em = document.createElement('em');
    em.textContent = emphasis || '';
    node.replaceChildren(document.createTextNode(lead || ''), br, document.createTextNode(middle || ''), em);
  };
  const externalLink = (label, url, className = '') => {
    if (!url) return '';
    return `<a${className ? ` class="${className}"` : ''} href="${escape(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${label} <span aria-hidden="true">↗</span></a>`;
  };
  const escape = value => String(value || '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const applyTextArray = (container, values, tag = 'p', className = '') => {
    if (!container || !Array.isArray(values)) return;
    container.replaceChildren(...values.map(value => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      node.textContent = value;
      return node;
    }));
  };

  const renderPerson = (person, index) => {
    const cardImage = person.portrait ? `<img class="person-thumb${index === 1 ? ' redza-thumb' : ''}" src="${escape(imageUrl(person.portrait))}" alt="${escape(person.portraitAlt || person.name)}">` : '';
    const card = `<article class="person-card">${cardImage}<div><h4>${escape(person.name)}</h4><p>${escape(person.shortRole || person.role || '')}</p></div></article>`;
    const photo = person.portrait ? `<figure class="founder-portrait">${index === 0 ? `<div class="portrait-frame ivlynn-portrait-frame"><img src="${escape(imageUrl(person.portrait))}" alt="${escape(person.portraitAlt || person.name)}"></div>` : `<img src="${escape(imageUrl(person.portrait))}" alt="${escape(person.portraitAlt || person.name)}">`}${person.photoCredit ? `<figcaption>${person.photoCreditUrl ? `Photo: ${externalLink(escape(person.photoCredit), person.photoCreditUrl)}` : `Photo: ${escape(person.photoCredit)}`}</figcaption>` : ''}</figure>` : '';
    const biography = (person.biography || []).map(paragraph => `<p>${escape(paragraph)}</p>`).join('');
    const career = (person.career || []).length ? `<div class="portfolio-label">Selected experience &amp; portfolio</div><ul class="career-list">${person.career.map((entry, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span><div><strong>${escape(entry.heading)}</strong><small>${escape(entry.detail)}</small></div></li>`).join('')}</ul>` : '';
    const statistic = person.statistic ? `<p class="portfolio-stat"><strong>${escape(person.statistic)}</strong><span>${escape(person.statisticText)}</span></p>` : '';
    const sources = (person.sources || []).length ? `<p class="founder-sources">Profile references: ${person.sources.map(source => externalLink(escape(source.label), source.url)).join(' · ')}</p>` : '';
    const profile = `<article class="founder-profile${index === 1 ? ' redza-profile' : ' ivlynn-profile'}">${photo}<div class="founder-copy"><p class="eyebrow">Leadership profile</p><h3>${escape(person.name)}</h3><p class="founder-role">${escape(person.role)}</p>${biography}${career}${statistic}${sources}</div></article>`;
    return { card, profile };
  };

  const apply = data => {
    if (data.brand) {
      document.querySelectorAll('.brand img').forEach(img => setImage(img, data.brand.logo, data.brand.logoAlt));
      text('.footer-main > p', data.brand.tagline);
    }
    if (data.hero) {
      const hero = data.hero;
      text('.hero-copy > .eyebrow', hero.eyebrow);
      setHeading(document.querySelector('#hero-title'), hero.titleLead, hero.titleEmphasis, hero.titleMiddle || 'moments ');
      text('.hero-lede', hero.lede);
      const buttons = document.querySelectorAll('.hero-actions a');
      if (buttons[0]) buttons[0].innerHTML = `${escape(hero.primaryLabel)} <span aria-hidden="true">→</span>`;
      if (buttons[1]) buttons[1].textContent = hero.secondaryLabel;
      setImage(document.querySelector('.hero-photo img'), hero.photo, hero.photoAlt);
      text('.hero-photo figcaption > span', hero.photoCaption);
      const credit = document.querySelector('.hero-photo figcaption a');
      if (credit) { credit.href = safeUrl(hero.photoCreditUrl); credit.textContent = `${hero.photoCredit} ↗`; }
      const facts = document.querySelectorAll('.hero-bottom > span');
      if (facts[0]) facts[0].textContent = hero.established;
      if (facts[1]) facts[1].textContent = hero.locations;
    }
    if (data.about) {
      const about = data.about;
      text('.about-grid .eyebrow', about.eyebrow);
      setHeading(document.querySelector('#about-title'), about.titleLead, about.titleEmphasis);
      const aboutCopy = document.querySelector('.about-copy');
      applyTextArray(aboutCopy, about.paragraphs);
      if (aboutCopy) {
        const link = document.createElement('a'); link.className = 'text-link'; link.href = '#team';
        link.innerHTML = `${escape(about.linkLabel)} <span aria-hidden="true">→</span>`; aboutCopy.appendChild(link);
      }
      text('.team-block .subhead .eyebrow', about.peopleEyebrow);
      text('.team-block .subhead h3', about.peopleTitle);
    }
    if (Array.isArray(data.people)) {
      const grid = document.querySelector('.people-grid');
      const team = document.querySelector('.team-block');
      const rendered = data.people.map(renderPerson);
      if (grid) grid.innerHTML = rendered.map(person => person.card).join('');
      if (team) {
        team.querySelectorAll(':scope > .founder-profile').forEach(node => node.remove());
        team.insertAdjacentHTML('beforeend', rendered.map(person => person.profile).join(''));
      }
    }
    if (data.partners) {
      text('.partner-label', data.partners.label);
      text('.partner-strip p', (data.partners.names || []).join(' · '));
    }
    if (data.services) {
      const section = data.services;
      const head = document.querySelector('.services-section .section-heading');
      if (head) {
        text('.eyebrow', section.eyebrow, head);
        setHeading(head.querySelector('h2'), section.titleLead, section.titleEmphasis, section.titleMiddle || 'around ');
        text('.section-intro', section.intro, head);
      }
      const grid = document.querySelector('.service-grid');
      if (grid) grid.innerHTML = (section.items || []).map(item => `<a class="service-card${item.accent ? ' service-card-accent' : ''}" href="${escape(safeUrl(item.link))}"><span class="card-index">${escape(item.category)}</span><h3>${escape(item.title)}</h3><p>${escape(item.description)}</p><span class="card-link">${escape(item.linkLabel)} <b>↗</b></span></a>`).join('');
    }
    if (data.programmes) {
      const section = data.programmes;
      const head = document.querySelector('.programme-section .section-heading');
      if (head) {
        text('.eyebrow', section.eyebrow, head);
        setHeading(head.querySelector('h2'), section.titleLead, section.titleEmphasis, section.titleMiddle || '');
        text('.section-intro', section.intro, head);
      }
      const rows = document.querySelector('.programme-list');
      if (rows) rows.innerHTML = (section.items || []).map((item, i) => `<a href="${escape(safeUrl(item.link))}" class="programme-row"><span>${String(i + 1).padStart(2, '0')}</span><strong>${escape(item.title)}</strong><b aria-hidden="true">↗</b></a>`).join('');
      text('.inline-cta p', section.cta);
      const cta = document.querySelector('.inline-cta a');
      if (cta) cta.innerHTML = `${escape(section.ctaLink)} <span aria-hidden="true">→</span>`;
    }
    if (data.insights) {
      const section = data.insights;
      const head = document.querySelector('.insights-section .section-heading');
      if (head) {
        text('.eyebrow', section.eyebrow, head);
        setHeading(head.querySelector('h2'), section.titleLead, section.titleEmphasis, section.titleMiddle || '');
        text('.section-intro', section.intro, head);
      }
      const grid = document.querySelector('.insight-grid');
      if (grid) grid.innerHTML = (section.items || []).map((item, i) => `<article class="insight-card${i === 0 ? ' insight-feature' : ''}"${item.symbol === 'R' ? ' id="research"' : ''}><div class="insight-card-top"><span class="content-type">${escape(item.category)}</span><span class="insight-symbol" aria-hidden="true">${escape(item.symbol)}</span></div><h3>${escape(item.title)}</h3><p>${escape(item.description)}</p>${item.articles?.length ? `<ul class="article-links">${item.articles.map(article => `<li><a href="${escape(safeUrl(article.url))}" target="_blank" rel="noopener noreferrer">${escape(article.title)} <span>${escape(article.attribution)} ↗</span></a></li>`).join('')}</ul>` : ''}${item.link ? externalLink(escape(item.linkLabel || 'Read more'), item.link, 'text-link') : ''}</article>`).join('');
    }
    if (data.books) {
      const section = data.books;
      text('.books-heading .eyebrow', section.eyebrow);
      text('.books-heading h3', section.title);
      text('.books-heading > p', section.note);
      const grid = document.querySelector('.book-grid');
      if (grid) grid.innerHTML = (section.items || []).map((item, i) => `<article class="book-card"><span class="book-mark">${String(i + 1).padStart(2, '0')}</span><div><p class="content-type">${escape(item.category)}</p><h4>${escape(item.title)}</h4><p>${escape(item.description)}</p><a href="${escape(safeUrl(item.link))}" class="text-link">${escape(item.linkLabel)} <span>↗</span></a></div></article>`).join('');
    }
    if (data.impact) {
      const section = data.impact;
      const inner = document.querySelector('.impact-inner');
      if (inner) {
        text('.impact-copy > .eyebrow', section.eyebrow, inner);
        setHeading(inner.querySelector('#impact-title'), section.titleLead, section.titleEmphasis);
        text('.impact-lede', section.intro, inner);
        const cards = inner.querySelector('.impact-cards');
        if (cards) cards.innerHTML = (section.items || []).map(item => `<article><span>${escape(item.category)}</span><h3>${escape(item.title)}</h3><p>${escape(item.description)}</p><a href="${escape(safeUrl(item.link))}">${escape(item.linkLabel)} <b>↗</b></a></article>`).join('');
      }
    }
    if (data.contact) {
      const contact = data.contact;
      setHeading(document.querySelector('#contact-title'), contact.titleLead, contact.titleEmphasis);
      text('.contact-left > .eyebrow', contact.eyebrow);
      text('.contact-left > p:not(.eyebrow)', contact.intro);
      const details = document.querySelector('.contact-details');
      if (details) {
        const email = details.querySelector('a[href^="mailto:"]');
        if (email) { email.href = `mailto:${contact.email}`; email.firstChild.textContent = contact.email + ' '; }
        const wa = details.querySelector('a[href^="https://wa.me/"]');
        if (wa) { wa.href = `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`; wa.firstChild.textContent = `WhatsApp ${contact.whatsapp} `; }
        const location = details.querySelector('span');
        if (location) location.textContent = contact.location;
        const fb = details.querySelector('.button-facebook');
        if (fb) fb.href = safeUrl(contact.facebook);
      }
      const footerContact = document.querySelector('.footer-contact');
      if (footerContact) { footerContact.href = `mailto:${contact.email}`; footerContact.textContent = contact.email; }
      const socialLinks = document.querySelectorAll('.footer-bottom nav a');
      socialLinks.forEach(anchor => {
        if (anchor.textContent.includes('Facebook')) anchor.href = safeUrl(contact.facebook);
        if (anchor.textContent.includes('Instagram')) anchor.href = safeUrl(contact.instagram);
      });
      text('.privacy-draft-copy > p:first-child', contact.privacyNote);
    }
  };

  fetch(CONTENT_URL, { cache: 'no-store' })
    .then(response => response.ok ? response.json() : Promise.reject(new Error('Content file unavailable')))
    .then(apply)
    .catch(() => { /* Keep the embedded Citrine page content if the JSON cannot be loaded. */ });
})();
