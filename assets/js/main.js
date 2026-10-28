(function(){
  // scroll reveal
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(function(el){ io.observe(el); });
  } else { els.forEach(function(el){ el.classList.add('in'); }); }

  // program carousels (home page chapters)
  document.querySelectorAll('.program').forEach(function(sec){
    var slides = sec.querySelectorAll('.slide');
    var imgs = sec.querySelectorAll('.slide-img');
    var dots = sec.querySelectorAll('.dot');
    var capEl = sec.querySelector('.cap-day');
    var n = Math.max(slides.length, imgs.length);
    var cur = 0;

    function render(){
      slides.forEach(function(s,i){ s.classList.toggle('active', i===cur); });
      imgs.forEach(function(im,i){ im.classList.toggle('active', i===cur); });
      dots.forEach(function(d,i){ d.classList.toggle('active', i===cur); });
      if (capEl) {
        var dayEl = slides[cur].querySelector('.slide-day');
        var titleEl = slides[cur].querySelector('h2');
        capEl.textContent = (dayEl ? dayEl.textContent : '') + ' — ' + (titleEl ? titleEl.textContent : '');
      }
    }
    function go(i){ cur = (i + n) % n; render(); }

    dots.forEach(function(d){ d.addEventListener('click', function(){ go(parseInt(d.getAttribute('data-goto'),10)); }); });
    render();
  });
  // galerie faune et paysages (accueil) : defilement automatique en boucle + defilement manuel
  // (molette horizontale, pave tactile, glisser tactile ou a la souris), sans fleches
  (function(){
    var box = document.querySelector('.gallery');
    var track = box && box.querySelector('.gallery-track');
    var first = track && track.querySelector('.gallery-set');
    if (!first) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return; // defilement manuel seulement, sans animation
    var second = first.cloneNode(true), third = first.cloneNode(true);
    track.appendChild(second); track.appendChild(third);
    var W = 0, pos = 0, lastSet = 0, lastUser = -3000, hover = false, touching = false, dragging = false, visible = true, prev = 0;
    function measure(){ W = second.offsetLeft - first.offsetLeft; }
    function put(x){ lastSet = x; box.scrollLeft = x; }
    function wrap(x){
      if (!W) return x;
      while (x >= 2 * W) x -= W;
      while (x < W) x += W;
      return x;
    }
    function init(){
      var rel = W ? ((box.scrollLeft - W) / W) : 0; // conserve la position relative apres un redimensionnement
      measure();
      pos = wrap(W + (rel > 0 && rel < 1 ? rel * W : 0));
      put(pos);
    }
    function speed(){ return window.innerWidth <= 640 ? 90 : 120; }
    function frame(t){
      var dt = prev ? Math.min(t - prev, 100) / 1000 : 0;
      prev = t;
      var idle = !hover && !touching && !dragging && (t - lastUser > 2500);
      if (visible && !document.hidden && idle && W) {
        pos += speed() * dt;
        var w = wrap(pos);
        if (w !== pos) pos = w;
        put(pos);
      } else {
        pos = box.scrollLeft;
      }
      requestAnimationFrame(frame);
    }
    box.addEventListener('scroll', function(){
      var sl = box.scrollLeft;
      if (Math.abs(sl - lastSet) > 2) lastUser = performance.now(); // defilement initie par la personne
      if (W && (sl >= 2 * W || sl < W)) { var x = wrap(sl); sl0 += (x - sl); put(x); pos = x; }
    }, { passive: true });
    box.addEventListener('touchstart', function(){ touching = true; lastUser = performance.now(); }, { passive: true });
    box.addEventListener('touchend', function(){ touching = false; lastUser = performance.now(); }, { passive: true });
    box.addEventListener('touchcancel', function(){ touching = false; }, { passive: true });
    box.addEventListener('pointerenter', function(e){ if (e.pointerType === 'mouse') hover = true; });
    box.addEventListener('pointerleave', function(e){ if (e.pointerType === 'mouse') { hover = false; lastUser = performance.now() - 2000; } });
    // glisser a la souris
    var sx = 0, sl0 = 0;
    box.addEventListener('pointerdown', function(e){
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true; sx = e.clientX; sl0 = box.scrollLeft; box.classList.add('dragging');
      try { box.setPointerCapture(e.pointerId); } catch (err) {}
    });
    box.addEventListener('pointermove', function(e){
      if (!dragging) return;
      lastUser = performance.now();
      box.scrollLeft = sl0 - (e.clientX - sx);
    });
    function endDrag(){ if (!dragging) return; dragging = false; box.classList.remove('dragging'); lastUser = performance.now(); }
    box.addEventListener('pointerup', endDrag);
    box.addEventListener('pointercancel', endDrag);
    box.addEventListener('dragstart', function(e){ e.preventDefault(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function(en){ visible = en[0].isIntersecting; }).observe(box);
    }
    window.addEventListener('resize', init);
    window.addEventListener('load', init);
    init();
    requestAnimationFrame(frame);
  })();
  // menu hamburger
  (function(){
    var btn = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!btn || !nav) return;
    function setOpen(open){
      nav.classList.toggle('open', open);
      document.body.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    btn.addEventListener('click', function(){ setOpen(!nav.classList.contains('open')); });
    nav.addEventListener('click', function(e){ if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', function(){ if (window.innerWidth > 860) setOpen(false); });
  })();
  // hero d'accueil : carrousel en fondu enchaîné + pastilles ; la première image est dans le HTML, les autres se chargent à la demande
  (function(){
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    if (slides.length < 2) return;
    var hero = slides[0].closest('.hero');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cur = 0, timer = null, req = 0, DELAY = 6500;
    var en = (document.documentElement.lang || 'es').slice(0, 2) === 'en';
    var nav = document.createElement('div');
    nav.className = 'hero-dots';
    nav.setAttribute('role', 'group');
    nav.setAttribute('aria-label', en ? 'Hero photos' : 'Fotos de portada');
    var dots = slides.map(function(_, i){
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'hero-dot';
      d.setAttribute('aria-label', (en ? 'Photo ' + (i + 1) + ' of ' : 'Foto ' + (i + 1) + ' de ') + slides.length);
      if (i === 0) d.setAttribute('aria-current', 'true');
      d.addEventListener('click', function(){ show(i); schedule(); });
      nav.appendChild(d);
      return d;
    });
    hero.appendChild(nav);
    function load(slide, cb){
      var src = slide.getAttribute('data-bg');
      if (!src) { cb(); return; }
      var im = new Image();
      im.onload = function(){ slide.style.backgroundImage = "url('" + src + "')"; slide.removeAttribute('data-bg'); cb(); };
      im.onerror = function(){ cb(true); };
      im.src = src;
    }
    function show(n){
      if (n === cur) return;
      var my = ++req;
      load(slides[n], function(err){
        if (err || my !== req) return;
        slides[cur].classList.remove('is-active');
        dots[cur].removeAttribute('aria-current');
        slides[n].classList.add('is-active');
        dots[n].setAttribute('aria-current', 'true');
        cur = n;
      });
    }
    function schedule(){
      clearTimeout(timer);
      if (reduce || document.hidden) return;
      timer = setTimeout(function(){ show((cur + 1) % slides.length); schedule(); }, DELAY);
    }
    document.addEventListener('visibilitychange', schedule);
    if (document.readyState === 'complete') schedule(); else window.addEventListener('load', schedule);
  })();
  // video d'accueil : le lecteur YouTube (youtube-nocookie) ne se charge qu'au clic
  document.querySelectorAll('.video-frame').forEach(function(box){
    var btn = box.querySelector('.video-play');
    if (!btn) return;
    btn.addEventListener('click', function(){
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + box.getAttribute('data-yt-id') + '?autoplay=1&rel=0&playsinline=1&hl=' + (box.getAttribute('data-yt-lang') || 'es');
      f.title = box.getAttribute('data-yt-title') || '';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.setAttribute('allowfullscreen', '');
      box.innerHTML = '';
      box.appendChild(f);
      f.focus();
    });
  });
})();
