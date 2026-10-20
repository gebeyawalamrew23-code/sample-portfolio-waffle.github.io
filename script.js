(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = $('.loader');
  const number = $('#load-number');
  const line = $('.loader-line i');
  let progress = 0;
  const start = performance.now();
  function loadFrame(now) {
    progress = Math.min(100, Math.round((now - start) / 9));
    number.textContent = String(progress).padStart(2,'0');
    line.style.width = progress + '%';
    if (progress < 100) requestAnimationFrame(loadFrame);
    else setTimeout(() => { loader.classList.add('done'); document.body.classList.remove('locked'); }, 180);
  }
  if (reduceMotion) { loader.classList.add('done'); } else { document.body.classList.add('locked'); requestAnimationFrame(loadFrame); }
  $('#year').textContent = new Date().getFullYear();

  // Scroll reveal, with a graceful fallback for browsers without IntersectionObserver.
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach(el => observer.observe(el));
  } else revealItems.forEach(el => el.classList.add('in-view'));

  // Navigation menu for mobile.
  const menuButton = $('.menu-toggle');
  const mobileMenu = $('.mobile-menu');
  function closeMenu() { menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Open menu'); mobileMenu.classList.remove('open'); }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.classList.toggle('open', open);
  });
  $$('.mobile-menu a').forEach(a => a.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 650) closeMenu(); });

  // Custom cursor and restrained magnetic button movement on fine pointers only.
  const dot = $('.cursor-dot'), ring = $('.cursor-ring');
  if (window.matchMedia('(pointer:fine)').matches && !reduceMotion) {
    let x = innerWidth/2, y = innerHeight/2, rx=x, ry=y, seen=false;
    dot.style.opacity = ring.style.opacity = '0'; // hidden until the first real mouse move (no stray dot at 0,0)
    window.addEventListener('mousemove', e => {
      x=e.clientX; y=e.clientY; dot.style.left=x+'px'; dot.style.top=y+'px';
      if (!seen) { seen=true; rx=x; ry=y; dot.style.opacity = ring.style.opacity = ''; }
    }, {passive:true});
    document.documentElement.addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = '0'; });
    document.documentElement.addEventListener('mouseenter', () => { if (seen) dot.style.opacity = ring.style.opacity = ''; });
    function cursorLoop(){rx += (x-rx)*.16; ry += (y-ry)*.16; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(cursorLoop)} cursorLoop();
    // Delegated, so buttons created later (work cards, archive ring, viewer controls) also get the hover state.
    document.addEventListener('mouseover', e => { ring.classList.toggle('hover', !!(e.target.closest && e.target.closest('a,button,select,.v-media img'))); }, {passive:true});
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => { const r=el.getBoundingClientRect(); const dx=e.clientX-(r.left+r.width/2); const dy=e.clientY-(r.top+r.height/2); el.style.transform=`translate(${dx*.07}px,${dy*.07}px)`; });
      el.addEventListener('mouseleave',()=>{el.style.transform='';});
    });
  }

})();
