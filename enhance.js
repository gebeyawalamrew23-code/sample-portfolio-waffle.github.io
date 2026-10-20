(() => {
  'use strict';
  /* ---- SET YOUR REAL EMAIL HERE to activate the contact form / email link ---- */
  const CONTACT_EMAIL = '';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(pointer:fine)').matches;
  const D = window.PORTFOLIO || [];
  const url = p => 'assets/' + encodeURI(p).replace(/&/g, '%26');
  const pad = n => String(n).padStart(2, '0');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const CATS = { brand: 'BRAND IDENTITY', sports: 'SPORTS BRANDING', packaging: 'PACKAGING', campaign: 'CAMPAIGN', motion: 'MOTION' };

  /* ===== Work grid + filters (counts are computed, not hard-coded) ===== */
  const grid = $('#hs-track'), tabs = $('#hs-tabs'), hs = $('#hs');
  const catList = Object.keys(CATS).filter(c => D.some(p => p.cat === c));
  const C = catList.map(c => { const ps = D.filter(p => p.cat === c); return { slug: c, cat: c, title: CATS[c], accent: ps[0].accent, palette: ps[0].palette, projects: ps, items: ps.flatMap(p => p.items.map(it => ({ ...it, proj: p }))) }; });
  $('#work-count').textContent = D.length;
  tabs.innerHTML = C.map((c, i) => `<button class="hs-tab ${i ? '' : 'on'}" data-t="${i}" role="tab">${c.title}<span class="n">${pad(c.items.length)}</span></button>`).join('');
  grid.innerHTML = C.map((c, ci) => `<div class="hs-panel" data-c="${ci}" style="--acc:${c.accent}"><div class="hs-intro"><small>${pad(ci + 1)} / ${pad(C.length)}</small><h3>${c.title}</h3><div><p>${pad(c.projects.length)} PROJECT${c.projects.length > 1 ? 'S' : ''} · ${c.items.length} PIECES</p><ul>${c.projects.map(p => `<li>${esc(p.title)}</li>`).join('')}</ul></div></div>` +
    c.items.map((it, k) => `<button class="hs-card" data-c="${ci}" data-k="${k}" style="--r:${(it.w / it.h).toFixed(4)}" aria-label="Open ${esc(it.proj.title)}, image ${k + 1} of ${c.items.length}"><img src="${url(it.thumb)}" alt="${esc(it.proj.title)}" width="${it.w}" height="${it.h}" ${ci + k < 6 ? '' : 'loading="lazy"'} draggable="false">${it.type === 'video' ? '<span class="play">&#9654;</span>' : ''}<span class="cap">${esc(it.proj.title)}</span></button>`).join('') + '</div>').join('');
  grid.insertAdjacentHTML('beforeend', '<i class="hs-end" aria-hidden="true"></i>');
  const panels = $$('.hs-panel'), hcards = $$('.hs-card'), hbar = $('.hs-bar i'), hsPin = $('.hs-pin'), hint = $('.hs-hint'), nav = $('.hs-nav'), arrows = $$('.hs-arrow');
  /* Native (swipe/drag + arrows) mode for narrow, touch and tablet screens; pinned scroll-driven mode for wide fine-pointer screens. */
  const mq = matchMedia('(max-width:1024px), (pointer:coarse)');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const SPD = .6;            // page scroll px per track px (lower = faster). Was .36 (≈2.8× speed) – now ≈1.7×, and eased below.
  const vw = () => document.documentElement.clientWidth || innerWidth;
  let hsNative = true, maxX = 0, activeTab = 0, hsCache = [], hsX = 0, hsReady = false, hsLive = false;
  grid.setAttribute('tabindex', '0'); grid.setAttribute('role', 'region'); grid.setAttribute('aria-label', 'Selected work slideshow');
  const padL = () => parseFloat(getComputedStyle(grid).paddingLeft) || 0;
  const maxScroll = () => Math.max(0, grid.scrollWidth - grid.clientWidth);
  const hsProg = () => { if (hsNative) { const m = maxScroll(); return m > 0 ? grid.scrollLeft / m : 0; } const r = hs.getBoundingClientRect(); return clamp(-r.top / Math.max(1, hs.offsetHeight - hsPin.offsetHeight), 0, 1); };
  const setTab = i => { if (i === activeTab) return; activeTab = i; $$('.hs-tab', tabs).forEach((t, k) => { t.classList.toggle('on', k === i); t.setAttribute('aria-selected', k === i); }); };
  function updateNative() {
    const m = maxScroll(), s = grid.scrollLeft;
    hbar.style.transform = `scaleX(${m > 0 ? clamp(s / m, 0, 1) : 1})`;
    let a = 0; panels.forEach((pn, i) => { if (pn.offsetLeft - padL() - 60 <= s + 10) a = i; }); if (m > 0 && s >= m - 2) a = panels.length - 1; setTab(a);
    arrows[0].disabled = s <= 2; arrows[1].disabled = s >= m - 2; nav.hidden = m <= 0;
  }
  function layoutHS() {
    const wasNative = hsNative, was = hsReady ? hsProg() : 0;
    const topBefore = hs.getBoundingClientRect().top, inView = hsReady && topBefore < innerHeight && hs.getBoundingClientRect().bottom > 0;
    document.documentElement.style.setProperty('--vw', vw() + 'px');
    hsNative = RM || mq.matches; hs.classList.toggle('native', hsNative); grid.style.transform = ''; hcards.forEach(c => c.style.transform = '');
    if (hsNative) { hs.style.height = ''; maxX = 0; hsX = 0; }
    else {
      maxX = Math.max(0, grid.scrollWidth - vw()); hs.style.height = (maxX * SPD + hsPin.offsetHeight) + 'px';
      hsCache = hcards.map(c => c.offsetLeft + c.offsetWidth / 2);
    }
    hint.hidden = hsNative;
    if (hsReady && inView) { // keep the viewer's position inside the slideshow across resize / rotation / breakpoint change
      const docTop = hs.getBoundingClientRect().top + scrollY;
      if (hsNative) { grid.scrollLeft = was * maxScroll(); if (!wasNative) { scrollTo({ top: docTop - 96, behavior: 'instant' }); } }
      else { scrollTo({ top: docTop + was * (hs.offsetHeight - hsPin.offsetHeight), behavior: 'instant' }); }
      tgt = sy = scrollY; sm = false;
    }
    hsX = hsNative ? 0 : -hsProg() * maxX; hsLive = false;
    if (hsNative) updateNative();
    hsReady = true;
  }
  let hsT = 0; const queueLayout = () => { clearTimeout(hsT); hsT = setTimeout(() => { if (!document.body.classList.contains('locked')) layoutHS(); }, 90); }; // ignore the scrollbar-width change while the page is locked
  new MutationObserver(() => { if (!document.body.classList.contains('locked')) queueLayout(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  addEventListener('resize', queueLayout); addEventListener('orientationchange', queueLayout); addEventListener('load', layoutHS); mq.addEventListener('change', layoutHS);
  if (window.visualViewport) visualViewport.addEventListener('resize', queueLayout);
  if ('ResizeObserver' in window) new ResizeObserver(queueLayout).observe(hsPin);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutHS);
  grid.querySelectorAll('img').forEach(im => { if (!im.complete) im.addEventListener('load', queueLayout, { once: true }); });

  tabs.addEventListener('click', e => {
    const b = e.target.closest('.hs-tab'); if (!b) return; const pn = panels[+b.dataset.t];
    if (hsNative) { grid.scrollTo({ left: Math.max(0, pn.offsetLeft - padL()), behavior: RM ? 'auto' : 'smooth' }); return; }
    const y = hs.getBoundingClientRect().top + scrollY + Math.min(Math.max(0, pn.offsetLeft - padL()), maxX) * SPD;
    if (FINE) { tgt = y; sm = true; } else scrollTo({ top: y, behavior: 'smooth' });
  });
  grid.addEventListener('click', e => { const c = e.target.closest('.hs-card'); if (c) open(+c.dataset.c, +c.dataset.k, $('img', c)); });
  grid.addEventListener('scroll', () => { if (hsNative) updateNative(); }, { passive: true });

  /* previous / next arrows (native mode) – jump to the nearest card boundary about 80% of a screen away */
  function stepNative(dir) {
    const s = grid.scrollLeft, w = grid.clientWidth, pad = padL(), want = s + dir * w * .8;
    const stops = [...panels, ...hcards].map(el => el.offsetLeft - pad);
    let t = stops.reduce((b, x) => Math.abs(x - want) < Math.abs(b - want) ? x : b, stops[0]);
    if ((dir > 0 && t <= s + 8) || (dir < 0 && t >= s - 8)) t = want;
    grid.scrollTo({ left: clamp(t, 0, maxScroll()), behavior: RM ? 'auto' : 'smooth' });
  }
  arrows.forEach(b => b.addEventListener('click', () => stepNative(+b.dataset.d)));
  grid.addEventListener('keydown', e => { if (!hsNative || e.altKey || e.ctrlKey || e.metaKey) return; if (e.key === 'ArrowRight') { e.preventDefault(); stepNative(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); stepNative(-1); } });
  /* mouse drag-to-scroll in native mode (touch uses the browser's own momentum scrolling) */
  let drag = null, moved = false;
  grid.addEventListener('pointerdown', e => { if (!hsNative || e.pointerType !== 'mouse' || e.button !== 0) return; drag = { x: e.clientX, s: grid.scrollLeft }; moved = false; });
  addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x; if (!moved && Math.abs(dx) > 6) { moved = true; grid.classList.add('dragging'); } if (moved) grid.scrollLeft = drag.s - dx; });
  const endDrag = () => { if (!drag) return; drag = null; grid.classList.remove('dragging'); setTimeout(() => { moved = false; }, 0); };
  addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);
  grid.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); } }, true);

  /* ===== Scroll engine: direction-aware reveals, header, progress, 3D depth ===== */
  let tgt = scrollY, sy = scrollY, sm = false;
  layoutHS();
  if (FINE && !RM) {
    document.documentElement.style.scrollBehavior = 'auto';
    addEventListener('wheel', e => { if (e.ctrlKey || document.body.classList.contains('locked') || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; e.preventDefault(); tgt = Math.max(0, Math.min(tgt + e.deltaY * (e.deltaMode === 1 ? 32 : 1), document.documentElement.scrollHeight - innerHeight)); sm = true; }, { passive: false });
    addEventListener('scroll', () => { if (!sm) tgt = sy = scrollY; });
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const h = a.getAttribute('href'), el = h.length > 1 && $(h); if (!el) return; e.preventDefault(); tgt = el.getBoundingClientRect().top + scrollY - (h === '#home' ? 0 : 80); sm = true; }));
  }
  let lastY = scrollY, dir = 1, vel = 0;
  const bar = $('.progress-bar i'), top = $('.topbar'), ticker = $('.ticker-track');
  const revealEls = $$('.reveal');
  if (!RM && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      const t = en.target;
      if (en.isIntersecting) {
        t.style.setProperty('--ry', dir > 0 ? '56px' : '-56px'); t.style.setProperty('--rx', dir > 0 ? '10deg' : '-10deg');
        requestAnimationFrame(() => t.classList.add('in-view'));
      } else if (en.boundingClientRect.top > 0 || dir) { // leaving: re-arm for the opposite direction
        t.style.setProperty('--ry', en.boundingClientRect.top > 0 ? '56px' : '-56px');
        t.style.setProperty('--rx', en.boundingClientRect.top > 0 ? '10deg' : '-10deg');
        t.classList.remove('in-view');
      }
    }), { threshold: .1, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(el => { el.classList.remove('in-view'); io.observe(el); });
  } else revealEls.forEach(el => el.classList.add('in-view'));

  const depthEls = [...$$('.service'), ...$$('.tool-chip'), $('.statement-text'), $('.hero-orb'), $('.hero-title')].filter(Boolean);
  depthEls.forEach(el => el.setAttribute('data-depth', ''));

  /* ring */
  const ring = $('#ring'), ringSec = $('#depth');
  ring.innerHTML = D.map((p, i) => `<button class="ring-card" data-i="${i}" aria-label="Open ${esc(p.title)}"><img src="${url(p.cover)}" alt="" loading="lazy"><span>${pad(i + 1)} · ${esc(p.title)}</span></button>`).join('');
  const rc = $$('.ring-card');
  let ringR = 400, ringA = 0, ringLive = false;
  function layoutRing() {
    const w = ring.offsetWidth || 200; ringR = Math.round((w * 1.28) / (2 * Math.tan(Math.PI / D.length)));
    rc.forEach((c, i) => c.style.transform = `rotateY(${i * 360 / D.length}deg) translateZ(${ringR}px)`);
  }
  layoutRing(); addEventListener('resize', layoutRing); if ('ResizeObserver' in window) new ResizeObserver(layoutRing).observe(ring);

  let lastT = performance.now();
  function frame(now = performance.now()) {
    const dt = Math.min(.05, Math.max(.001, (now - lastT) / 1000)); lastT = now; // frame-rate independent easing
    if (sm) { sy += (tgt - sy) * (1 - Math.exp(-dt * 5.5)); if (Math.abs(tgt - sy) < .5) { sy = tgt; sm = false; } scrollTo(0, sy); }
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (Math.abs(y - lastY) > 1) dir = y > lastY ? 1 : -1;
    vel += ((y - lastY) - vel) * .15; lastY = y;
    bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    top.classList.toggle('hide', dir > 0 && y > 240 && !$('.mobile-menu.open'));
    if (!RM) {
      if (ticker) ticker.style.transform = `skewX(${Math.max(-14, Math.min(14, -vel * .5))}deg)`;
      const vh = innerHeight;
      depthEls.forEach(el => {
        const r = el.getBoundingClientRect(); if (r.bottom < -100 || r.top > vh + 100) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
        el.style.transform = el.classList.contains('hero-orb') ? `translate3d(0,${y * .12}px,0) rotate(${y * .05}deg)`
          : `perspective(1000px) rotateX(${p * -7}deg) translateZ(${-Math.abs(p) * 40}px)`;
      });
      if (!hsNative) {
        const r = hs.getBoundingClientRect(), pinH = hsPin.offsetHeight;
        if (r.top < vh && r.bottom > 0) {
          const prog = clamp(-r.top / Math.max(1, hs.offsetHeight - pinH), 0, 1), want = -prog * maxX;
          if (!hsLive) { hsX = want; hsLive = true; }       // no sweep when the section first comes into view
          hsX += (want - hsX) * (1 - Math.exp(-dt * 7));     // eased glide: the track follows the scroll smoothly
          if (Math.abs(want - hsX) < .1) hsX = want;
          const x = hsX; grid.style.transform = `translate3d(${x}px,0,0)`; hbar.style.transform = `scaleX(${prog})`;
          const W = vw();
          hcards.forEach((c, n) => { const cx = hsCache[n] + x; if (cx < -400 || cx > W + 400) return; const p = (cx - W / 2) / W; c.style.transform = `perspective(1200px) rotateY(${p * -16}deg) translateZ(${-Math.abs(p) * 90}px)`; });
          let a = 0; panels.forEach((pn, n) => { if (pn.offsetLeft + x <= W * .4) a = n; }); if (prog > .995) a = panels.length - 1; setTab(a);
        } else hsLive = false;
      }
      // ring rotation scrubbed by scroll (down = spin forward, up = rewinds)
      const rr = ringSec.getBoundingClientRect(), span = ringSec.offsetHeight - vh;
      if (rr.top < vh && rr.bottom > 0) {
        const prog = clamp(-rr.top / Math.max(1, span), 0, 1), end = 360 * (D.length - 1) / D.length;
        const want = clamp((prog - .04) / .92, 0, 1) * end;      // first card starts front-and-centre, last card ends front-and-centre
        if (!ringLive) { ringA = want; ringLive = true; }
        ringA += (want - ringA) * (1 - Math.exp(-dt * 8)); if (Math.abs(want - ringA) < .02) ringA = want;
        const ang = ringA;
        ring.style.transform = `translateZ(${-ringR}px) rotateX(-9deg) rotateY(${-ang}deg)`;
        rc.forEach((c, i) => {
          let a = (((i * 360 / D.length) - ang) % 360 + 540) % 360 - 180; const f = 1 - Math.abs(a) / 180;
          c.style.setProperty('--o', (.25 + f * .75).toFixed(2)); c.style.setProperty('--b', (.4 + f * .7).toFixed(2));
        });
      } else ringLive = false;
    }
    requestAnimationFrame(frame);
  }
  if (!RM) requestAnimationFrame(frame); else frame();

  /* hero mouse parallax */
  const hero = $('.hero');
  if (FINE && !RM && hero) hero.addEventListener('mousemove', e => {
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5, t = $('.hero-title-wrap');
    if (t) t.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
  });

  /* ===== Case-study viewer ===== */
  const V = document.createElement('div');
  V.className = 'viewer'; V.setAttribute('role', 'dialog'); V.setAttribute('aria-modal', 'true'); V.setAttribute('aria-label', 'Project case study viewer');
  V.innerHTML = `<div class="v-bg"></div><div class="v-glow"></div>
  <div class="v-top"><div class="brand"><i></i><span class="v-count"></span></div>
   <div class="v-act"><button class="v-btn" data-a="ov" aria-pressed="false">&#9638; <span class="t">OVERVIEW</span></button><button class="v-btn" data-a="zoom" aria-pressed="false">&#10530; <span class="t">ZOOM</span></button><button class="v-btn" data-a="link">&#10697; <span class="t">COPY LINK</span></button><button class="v-btn" data-a="close" aria-label="Close viewer">&#10005; <span class="t">CLOSE</span></button></div></div>
  <div class="v-body"><div class="v-stage"><button class="v-arrow v-prev" data-a="prev" aria-label="Previous image">&larr;</button><div class="v-media" aria-live="polite"></div><button class="v-arrow v-next" data-a="next" aria-label="Next image">&rarr;</button></div>
   <aside class="v-info"><div class="v-cat"></div><h2></h2><p></p><dl><dt>DELIVERABLES</dt><dd class="v-dl"></dd><dt>PALETTE</dt><dd><div class="v-pal"></div></dd></dl>
    <div class="v-pn"><button class="v-btn" data-a="pp"></button><button class="v-btn" data-a="np"></button></div>
    <div class="v-rec"><h3>RECOMMENDED NEXT</h3><div class="v-recs"></div></div></aside></div>
  <div class="v-keys">&larr; &rarr; BROWSE · PGUP/PGDN PROJECT · G OVERVIEW · Z ZOOM · ESC CLOSE</div>
  <div class="v-strip"></div><div class="v-prog"></div><div class="v-grid"></div>`;
  document.body.appendChild(V);
  const q = s => $(s, V);
  const media = q('.v-media');
  let pi = 0, ii = 0, opener = null, lastFocus = null;

  let track, slides;
  function buildTrack(p) {
    media.innerHTML = '<div class="v-track">' + p.items.map(it => it.type === 'video'
      ? `<div class="v-slide"><video data-src="${url(it.src)}" poster="${url(it.thumb)}" controls playsinline loop muted></video></div>`
      : `<div class="v-slide"><img data-src="${url(it.src)}" src="${url(it.thumb)}" alt="${esc(p.title)}" draggable="false"></div>`).join('') + '</div>';
    track = $('.v-track', media); slides = $$('.v-slide', track);
  }
  function show(i, d = 0, animate = true) {
    const p = C[pi], items = p.items; ii = (i + items.length) % items.length; const it = items[ii];
    if (!animate || RM) track.style.transition = 'none';
    track.style.transform = `translate3d(${-ii * 100}%,0,0)`;
    if (!animate || RM) { void track.offsetWidth; track.style.transition = ''; }
    slides.forEach((s, k) => {
      s.classList.toggle('cur', k === ii);
      if (Math.abs(k - ii) <= 1) { const m = $('img', s); if (m && m.dataset.src) { m.src = m.dataset.src; delete m.dataset.src; } }
      const v = $('video', s); if (v) { if (k === ii) { if (!v.getAttribute('src')) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause(); }
    });
    const pr = it.proj; V.style.setProperty('--acc', pr.accent); q('h2', V).textContent = pr.title; q('.v-info p').textContent = pr.blurb; q('.v-dl').textContent = pr.deliverables;
    q('.v-pal').innerHTML = pr.palette.map(c => `<i style="background:${c}" title="${c}"></i>`).join('');
    q('.v-bg').style.backgroundImage = `url("${url(it.thumb)}")`;
    q('.v-count').textContent = `${pad(pi + 1)} / ${pad(C.length)} · ${pad(ii + 1)} / ${pad(items.length)}`;
    q('.v-prog').style.width = ((ii + 1) / items.length * 100) + '%';
    $$('.v-strip button', V).forEach((b, k) => b.classList.toggle('on', k === ii));
    { const on = $('.v-strip button.on', V), st = q('.v-strip'); // scroll only the strip – scrollIntoView() also shifted the viewer itself
      if (on) st.scrollTo({ left: on.offsetLeft - (st.clientWidth - on.offsetWidth) / 2, behavior: RM || !animate ? 'auto' : 'smooth' }); }
    V.classList.remove('zoom'); q('[data-a=zoom]').setAttribute('aria-pressed', 'false');
    history.replaceState(null, '', `#work/${p.slug}/${ii + 1}`);
  }
  function loadProject(i, startAt = 0, d = 1) {
    pi = (i + C.length) % C.length; const p = C[pi];
    q('.v-cat').textContent = p.title;
    const prev = C[(pi - 1 + C.length) % C.length], next = C[(pi + 1) % C.length];
    q('[data-a=pp]').innerHTML = `<small>&larr; PREV CATEGORY</small><br>${esc(prev.title)}`; q('[data-a=np]').innerHTML = `<small>NEXT CATEGORY &rarr;</small><br>${esc(next.title)}`;
    q('.v-strip').innerHTML = p.items.map((it, k) => `<button data-k="${k}" aria-label="Image ${k + 1}"><img src="${url(it.thumb)}" alt="" loading="lazy"></button>`).join('');
    q('.v-grid').innerHTML = p.items.map((it, k) => `<button data-k="${k}" aria-label="Open image ${k + 1}"><img src="${url(it.thumb)}" alt=""></button>`).join('');
    q('.v-rec h3').textContent = 'OTHER CATEGORIES';
    q('.v-recs').innerHTML = C.map((x, k) => ({ x, k })).filter(o => o.k !== pi).slice(0, 3).map(o => `<button data-p="${o.k}" aria-label="Open ${esc(o.x.title)}"><img src="${url(o.x.items[0].thumb)}" alt=""><span>${esc(o.x.title)}</span></button>`).join('');
    V.classList.remove('ov'); q('[data-a=ov]').setAttribute('aria-pressed', 'false');
    buildTrack(p); show(startAt, d, false);
    if (!RM) media.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 900, easing: 'cubic-bezier(.16,1,.3,1)' });
  }
  function open(i, startAt = 0, from = null) {
    lastFocus = document.activeElement; opener = from; tgt = sy = scrollY; sm = false; loadProject(i, startAt, 1);
    V.classList.add('open'); document.body.classList.add('locked');
    if (from && !RM) { // expand from the clicked thumbnail
      const r = from.getBoundingClientRect();
      V.animate([{ clipPath: `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 18px)`, opacity: .6 }, { clipPath: 'inset(0 round 0)', opacity: 1 }], { duration: 750, easing: 'cubic-bezier(.2,.75,.2,1)' });
      $$('.v-top,.v-info,.v-strip', V).forEach((e, k) => e.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 350 + k * 90, easing: 'cubic-bezier(.2,.75,.2,1)', fill: 'backwards' }));
    }
    q('[data-a=close]').focus({ preventScroll: true });
  }
  function close() {
    const done = () => { V.classList.remove('open'); document.body.classList.remove('locked'); history.replaceState(null, '', '#work'); lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true }); };
    const el = opener && document.contains(opener) ? opener : null;
    if (el && !RM) {
      const r = el.getBoundingClientRect();
      V.animate([{ clipPath: 'inset(0 round 0)' }, { clipPath: `inset(${Math.max(0, r.top)}px ${Math.max(0, innerWidth - r.right)}px ${Math.max(0, innerHeight - r.bottom)}px ${Math.max(0, r.left)}px round 18px)`, opacity: .4 }], { duration: 550, easing: 'cubic-bezier(.6,0,.2,1)' }).onfinish = done;
    } else done();
  }
  const go = d => {
    const n = C[pi].items.length, nx = ii + d;
    if (nx < 0 || nx >= n) { show(nx, d, false); if (!RM) media.animate([{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' }); } // wrap first<->last without sweeping through every slide
    else show(nx, d);
  };
  const goProject = d => loadProject(pi + d, 0, d);
  const toggle = (cls, a) => { const on = V.classList.toggle(cls); const b = q(`[data-a=${a}]`); b.setAttribute('aria-pressed', on); return on; };

  V.addEventListener('click', e => {
    const b = e.target.closest('button'), a = b && b.dataset.a;
    if (b && b.dataset.p) return loadProject(+b.dataset.p, 0, 1);
    if (b && b.dataset.k !== undefined) { const k = +b.dataset.k; V.classList.remove('ov'); q('[data-a=ov]').setAttribute('aria-pressed', 'false'); return show(k, k > ii ? 1 : -1); }
    if (a === 'close') close(); else if (a === 'prev') go(-1); else if (a === 'next') go(1);
    else if (a === 'pp') goProject(-1); else if (a === 'np') goProject(1);
    else if (a === 'ov') toggle('ov', 'ov'); else if (a === 'zoom') toggle('zoom', 'zoom');
    else if (a === 'link') { const u = location.origin + location.pathname + location.hash; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => flash(b, 'COPIED ✓'), () => flash(b, 'COPY FAILED')); }
    else if (e.target.closest('.v-media img')) toggle('zoom', 'zoom');
  });
  function flash(b, t) { const s = $('.t', b), o = s.textContent; s.textContent = t; s.style.display = 'inline'; setTimeout(() => { s.textContent = o; s.style.display = ''; }, 1400); }

  q('.v-stage').addEventListener('mousemove', e => {
    if (!V.classList.contains('zoom')) return;
    const sl = $('.v-slide.cur', V); if (!sl) return; const r = sl.getBoundingClientRect();
    V.style.setProperty('--zx', ((e.clientX - r.left) / r.width * 100) + '%'); V.style.setProperty('--zy', ((e.clientY - r.top) / r.height * 100) + '%');
  });

  document.addEventListener('keydown', e => {
    if (!V.classList.contains('open')) return;
    const k = e.key;
    if (k === 'Escape') { V.classList.contains('ov') ? toggle('ov', 'ov') : close(); }
    else if (k === 'ArrowLeft') go(-1); else if (k === 'ArrowRight') go(1);
    else if (k === 'PageUp') { e.preventDefault(); goProject(-1); } else if (k === 'PageDown') { e.preventDefault(); goProject(1); }
    else if (k.toLowerCase() === 'g') toggle('ov', 'ov'); else if (k.toLowerCase() === 'z') toggle('zoom', 'zoom');
    else if (k === 'Tab') { // focus trap
      const f = $$('button:not([disabled]),video', V).filter(x => x.offsetParent !== null); if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  let tx = 0, ty = 0, tOK = false;
  V.addEventListener('touchstart', e => { tOK = !e.target.closest('.v-info,.v-strip,.v-grid'); tx = e.changedTouches[0].screenX; ty = e.changedTouches[0].screenY; }, { passive: true });
  V.addEventListener('touchend', e => { if (!tOK) return; const dx = e.changedTouches[0].screenX - tx, dy = e.changedTouches[0].screenY - ty; if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1); }, { passive: true });

  ring.addEventListener('click', e => { const c = e.target.closest('.ring-card'); if (!c) return; const pr = D[+c.dataset.i], ci = C.findIndex(x => x.cat === pr.cat); open(ci, Math.max(0, C[ci].items.findIndex(it => it.proj === pr)), c); });
  const fromHash = () => { const m = location.hash.match(/^#work\/([\w-]+)\/(\d+)/); if (!m) return; const i = C.findIndex(p => p.slug === m[1]); if (i > -1) open(i, Math.max(0, +m[2] - 1)); };
  addEventListener('load', () => setTimeout(fromHash, 1200));

  /* ===== Recommendations coverflow ===== */
  const cf = $('#coverflow'), cards = $$('.cf-card', cf), dots = $('#cf-dots');
  let cur = 1;
  dots.innerHTML = cards.map(() => '<i></i>').join('');
  function layoutCF() {
    cards.forEach((c, i) => {
      const o = i - cur, a = Math.abs(o), sx = Math.min(innerWidth * .34, 360);
      c.classList.toggle('on', !o);
      c.style.transform = `translateX(calc(-50% + ${o * sx}px)) translateZ(${-a * 150}px) rotateY(${-o * 38}deg) scale(${1 - a * .06})`;
      c.style.opacity = a > 1 ? 0 : 1 - a * .45; c.style.filter = a ? 'blur(1.5px) brightness(.7)' : 'none'; c.style.zIndex = 10 - a; c.style.pointerEvents = a > 1 ? 'none' : 'auto';
      c.setAttribute('aria-hidden', a ? 'true' : 'false');
    });
    $$('i', dots).forEach((d, i) => d.classList.toggle('on', i === cur));
  }
  const cfGo = d => { cur = (cur + d + cards.length) % cards.length; layoutCF(); };
  $('#cf-prev').addEventListener('click', () => cfGo(-1)); $('#cf-next').addEventListener('click', () => cfGo(1));
  cards.forEach((c, i) => c.addEventListener('click', () => { if (i !== cur) { cur = i; layoutCF(); } }));
  cf.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') cfGo(-1); if (e.key === 'ArrowRight') cfGo(1); });
  let dx0 = null;
  cf.addEventListener('pointerdown', e => { dx0 = e.clientX; });
  addEventListener('pointerup', e => { if (dx0 === null) return; const d = e.clientX - dx0; dx0 = null; if (Math.abs(d) > 50) cfGo(d < 0 ? 1 : -1); });
  addEventListener('resize', layoutCF); layoutCF();

  /* ===== Contact form ===== */
  const mail = $('#mail-link'), form = $('#contact-form'), note = $('#form-note');
  if (CONTACT_EMAIL) mail.href = 'mailto:' + CONTACT_EMAIL;
  else mail.addEventListener('click', e => { e.preventDefault(); $('#name').focus(); });
  form.addEventListener('submit', e => {
    e.preventDefault(); if (!form.reportValidity()) return;
    const d = new FormData(form);
    const body = `Hi Ifa,\n\nName: ${d.get('name')}\nEmail: ${d.get('email')}\nProject type: ${d.get('project')}\n\n${d.get('message')}`;
    if (CONTACT_EMAIL) {
      note.classList.remove('form-error'); note.textContent = 'Your email app should open with the message prepared. Review it and press Send.';
      location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Portfolio enquiry — ' + d.get('project'))}&body=${encodeURIComponent(body)}`;
    } else {
      (navigator.clipboard ? navigator.clipboard.writeText(body) : Promise.reject()).then(
        () => { note.textContent = 'Your message was copied to the clipboard. Set CONTACT_EMAIL in enhance.js to enable one-click email.'; },
        () => { note.textContent = 'Set CONTACT_EMAIL in enhance.js to enable the email draft.'; });
      note.classList.add('form-error');
    }
  });
})();
